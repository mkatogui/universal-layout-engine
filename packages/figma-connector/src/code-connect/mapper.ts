/**
 * Code Connect Mapper
 *
 * Maps between Figma component keys and UDS (Universal Design System)
 * component names, supporting both direct lookups and heuristic matching.
 */

export interface CodeConnectData {
  figmaKey: string;
  udsComponent: string;
  variant?: Record<string, string>;
  source?: string;
}

export interface ComponentSuggestion {
  figmaComponentKey: string;
  suggestedUdsComponent: string;
  confidence: number;
  reasoning: string;
}

/**
 * Calculates Levenshtein distance between two strings
 * @private
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculates similarity score between two strings (0-1)
 * @private
 */
function stringSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  return 1 - distance / maxLen;
}

/**
 * Normalizes component names for comparison
 * @private
 */
function normalizeName(name: string): string {
  return name
    .replace(/[\/\-_\s]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Code Connect Mapper for Figma ↔ UDS component mapping
 *
 * @example
 * ```ts
 * const mapper = new CodeConnectMapper();
 * await mapper.loadMappings('fileKey123');
 *
 * // Direct mapping
 * const uds = mapper.mapFigmaToUds('figma/Button/Primary');
 *
 * // Reverse mapping
 * const figma = mapper.mapUdsToFigma('Button');
 *
 * // Heuristic matching
 * const suggestions = mapper.suggestMappings([...]);
 * ```
 */
export class CodeConnectMapper {
  private mappings: Map<string, CodeConnectData> = new Map();
  private reverseMappings: Map<string, string> = new Map();
  private loadedFileKey: string | null = null;

  /**
   * Load Code Connect mappings from a file
   *
   * In a production implementation, this would fetch mappings from Figma
   * via the Code Connect API. Currently returns a stub implementation.
   *
   * @param fileKey Figma file key to load mappings for
   */
  async loadMappings(fileKey: string): Promise<void> {
    // In a real implementation, this would call FigmaMcpClient.getCodeConnectMap()
    // and parse the results into CodeConnectData entries
    this.loadedFileKey = fileKey;

    // Stub: Initialize with empty mappings
    // In production, populate from Figma API
    this.mappings.clear();
    this.reverseMappings.clear();
  }

  /**
   * Register a mapping between Figma component and UDS component
   *
   * @param figmaKey Figma component key (e.g., "figma/Button/Primary")
   * @param udsComponent UDS component name (e.g., "Button")
   * @param variant Optional variant mapping (e.g., { size: "lg", variant: "primary" })
   */
  registerMapping(figmaKey: string, udsComponent: string, variant?: Record<string, string>): void {
    const data: CodeConnectData = {
      figmaKey,
      udsComponent,
      variant,
    };

    this.mappings.set(figmaKey, data);
    this.reverseMappings.set(udsComponent, figmaKey);
  }

  /**
   * Map a Figma component key to a UDS component
   *
   * Returns the UDS component name and variant mapping for the given
   * Figma component key.
   *
   * @param figmaComponentKey Figma component key
   * @returns UDS component name and variant, or null if not found
   */
  mapFigmaToUds(figmaComponentKey: string): CodeConnectData | null {
    return this.mappings.get(figmaComponentKey) || null;
  }

  /**
   * Map a UDS component name back to a Figma component key
   *
   * Returns the original Figma component key for a given UDS component name.
   * Note: This is a reverse lookup and returns the first matching Figma
   * component if multiple exist.
   *
   * @param udsComponent UDS component name
   * @returns Figma component key, or null if not found
   */
  mapUdsToFigma(udsComponent: string): string | null {
    return this.reverseMappings.get(udsComponent) || null;
  }

  /**
   * Suggest Code Connect mappings using heuristic name matching
   *
   * Analyzes Figma component names and suggests which UDS components
   * they should map to based on string similarity and naming conventions.
   *
   * @param figmaComponents Array of Figma component keys
   * @param udsComponents Array of available UDS component names
   * @param similarityThreshold Minimum similarity score (0-1, default: 0.6)
   * @returns Array of suggestions ranked by confidence
   */
  suggestMappings(
    figmaComponents: string[],
    udsComponents: string[],
    similarityThreshold: number = 0.6,
  ): ComponentSuggestion[] {
    const suggestions: ComponentSuggestion[] = [];

    for (const figmaKey of figmaComponents) {
      // Skip if already mapped
      if (this.mappings.has(figmaKey)) {
        continue;
      }

      const figmaName = this.extractComponentName(figmaKey);
      const normalizedFigmaName = normalizeName(figmaName);

      let bestMatch: ComponentSuggestion | null = null;

      for (const udsComponent of udsComponents) {
        const normalizedUds = normalizeName(udsComponent);
        const similarity = stringSimilarity(normalizedFigmaName, normalizedUds);

        if (similarity >= similarityThreshold) {
          const confidence = similarity;
          const reasoning = this.generateReasoning(figmaName, udsComponent, confidence);

          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = {
              figmaComponentKey: figmaKey,
              suggestedUdsComponent: udsComponent,
              confidence,
              reasoning,
            };
          }
        }
      }

      if (bestMatch) {
        suggestions.push(bestMatch);
      }
    }

    // Sort by confidence (highest first)
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Extract the component name from a Figma component key
   * @private
   */
  private extractComponentName(figmaKey: string): string {
    // Extract the last component name from a path like "figma/Button/Primary"
    const parts = figmaKey.split('/');
    return parts[parts.length - 1] || figmaKey;
  }

  /**
   * Generate a human-readable explanation of why a mapping was suggested
   * @private
   */
  private generateReasoning(figmaName: string, udsComponent: string, confidence: number): string {
    const confidencePercent = Math.round(confidence * 100);

    if (confidence > 0.9) {
      return `Strong name match between "${figmaName}" and "${udsComponent}" (${confidencePercent}% similar)`;
    } else if (confidence > 0.75) {
      return `Good name match between "${figmaName}" and "${udsComponent}" (${confidencePercent}% similar)`;
    } else {
      return `Potential match between "${figmaName}" and "${udsComponent}" (${confidencePercent}% similar)`;
    }
  }

  /**
   * Get all registered mappings
   */
  getAllMappings(): Map<string, CodeConnectData> {
    return new Map(this.mappings);
  }

  /**
   * Clear all mappings
   */
  clearMappings(): void {
    this.mappings.clear();
    this.reverseMappings.clear();
    this.loadedFileKey = null;
  }

  /**
   * Get the currently loaded file key
   */
  getLoadedFileKey(): string | null {
    return this.loadedFileKey;
  }
}
