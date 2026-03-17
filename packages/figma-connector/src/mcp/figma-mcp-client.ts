/**
 * Figma MCP (Model Context Protocol) Client
 *
 * Wraps Claude's Figma MCP Server tools for accessing design context,
 * screenshots, metadata, Code Connect mappings, and variable definitions.
 */

export interface DesignContextResponse {
  code: string;
  screenshot: string;
  metadata: DesignMetadata;
  assets: Record<string, string>;
}

export interface DesignMetadata {
  nodeId: string;
  name: string;
  type: string;
  width: number;
  height: number;
  x: number;
  y: number;
  fills?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  }>;
  strokes?: Array<{
    color: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    weight: number;
  }>;
}

export interface ScreenshotResponse {
  imageUrl: string;
  width: number;
  height: number;
}

export interface MetadataResponse {
  nodeId: string;
  name: string;
  type: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  children?: MetadataResponse[];
}

export interface CodeConnectMapping {
  nodeId: string;
  componentName: string;
  source: string;
  label: string;
}

export interface CodeConnectMapResponse {
  [nodeId: string]: CodeConnectMapping;
}

export interface VariableDefinition {
  [key: string]: string;
}

/**
 * Client for Figma MCP Server tools
 *
 * @example
 * ```ts
 * const mcpClient = new FigmaMcpClient();
 * const context = await mcpClient.getDesignContext('fileKey123', '123:456');
 * const screenshot = await mcpClient.getScreenshot('fileKey123', '123:456');
 * const variables = await mcpClient.getVariableDefs('fileKey123');
 * ```
 */
export class FigmaMcpClient {
  /**
   * Get design context for a Figma node
   *
   * Returns reference code, screenshot, and contextual metadata for implementing
   * a design element. This is the primary tool for design-to-code workflows.
   *
   * @param fileKey Figma file key
   * @param nodeId Figma node ID (e.g., "123:456")
   * @returns Design context with code, screenshot, and metadata
   *
   * @throws Error if the node or file is not found
   */
  async getDesignContext(fileKey: string, nodeId: string): Promise<DesignContextResponse> {
    // In a real implementation, this would call the MCP Server tool
    // For now, return a typed stub
    throw new Error('getDesignContext must be called via MCP Server');
  }

  /**
   * Get a screenshot of a Figma node
   *
   * Renders the specified node as an image.
   *
   * @param fileKey Figma file key
   * @param nodeId Figma node ID
   * @returns Screenshot URL and dimensions
   *
   * @throws Error if the node cannot be rendered
   */
  async getScreenshot(fileKey: string, nodeId: string): Promise<ScreenshotResponse> {
    throw new Error('getScreenshot must be called via MCP Server');
  }

  /**
   * Get metadata for a Figma node or page
   *
   * Returns node hierarchy, IDs, layer types, names, positions, and sizes
   * in XML format for understanding the structure.
   *
   * @param fileKey Figma file key
   * @param nodeId Figma node ID (or page ID, e.g., "0:1")
   * @returns Hierarchical metadata for the node and children
   *
   * @throws Error if the node is not found
   */
  async getMetadata(fileKey: string, nodeId: string): Promise<MetadataResponse> {
    throw new Error('getMetadata must be called via MCP Server');
  }

  /**
   * Get Code Connect mappings between Figma components and code components
   *
   * Returns all existing Code Connect mappings in a file that link Figma
   * components to implementation code.
   *
   * @param fileKey Figma file key
   * @returns Map of nodeId → Code Connect mapping
   */
  async getCodeConnectMap(fileKey: string): Promise<CodeConnectMapResponse> {
    throw new Error('getCodeConnectMap must be called via MCP Server');
  }

  /**
   * Get variable definitions for a Figma file
   *
   * Returns all variable definitions (design tokens) in the file,
   * including their names, types, and values across all modes.
   *
   * @param fileKey Figma file key
   * @returns Map of variable names to their definitions
   */
  async getVariableDefs(fileKey: string): Promise<VariableDefinition> {
    throw new Error('getVariableDefs must be called via MCP Server');
  }

  /**
   * Get AI-suggested Code Connect mappings for components
   *
   * Uses heuristic analysis to suggest which code components should be
   * linked to Figma components based on naming and structure.
   *
   * @param fileKey Figma file key
   * @param nodeId Component node ID to suggest mappings for
   * @returns Suggested Code Connect mappings
   */
  async suggestCodeConnectMappings(fileKey: string, nodeId: string): Promise<CodeConnectMapping[]> {
    throw new Error('suggestCodeConnectMappings must be called via MCP Server');
  }
}
