import type {
  FigmaNode,
} from './rest/types.js';

import type {
  IRDocument,
  FrameNode,
  StackNode,
  TextNode,
  ComponentNode,
  LayoutNode,
  TokenRef,
  Direction,
  MainAxisAlign,
  CrossAxisAlign,
  SpacingToken,
} from '@mkatogui/ule-core';

/**
 * Figma Layout Parser
 *
 * Converts Figma design nodes into the Universal Layout IR
 * using `@mkatogui/ule-core` types exclusively.
 *
 * @example
 * ```ts
 * const parser = new FigmaLayoutParser();
 * const irDoc = parser.parseDocument('my-file', figmaRootNode);
 * ```
 */
export class FigmaLayoutParser {
  private readonly spacingGrid = 4; // px
  private nextId = 0;

  /**
   * Parse a full Figma file document into an IRDocument
   */
  parseDocument(fileId: string, rootNode: FigmaNode, pageName?: string): IRDocument {
    const frames: FrameNode[] = [];
    const children = rootNode.children ?? [];

    for (const child of children) {
      if (child.type === 'FRAME' || child.type === 'COMPONENT' || child.type === 'COMPONENT_SET') {
        frames.push(this.parseFrame(child));
      }
    }

    return {
      version: '1.0.0',
      meta: {
        name: rootNode.name,
        figmaFileId: fileId,
        figmaPageName: pageName,
        generatedAt: new Date().toISOString(),
        generatedBy: '@mkatogui/ule-figma-connector',
      },
      frames,
    };
  }

  /**
   * Parse a single Figma node tree into an IR LayoutNode
   */
  parse(node: FigmaNode): LayoutNode {
    return this.parseNode(node);
  }

  private generateId(prefix: string): string {
    return `${prefix}-${++this.nextId}`;
  }

  private parseFrame(node: FigmaNode): FrameNode {
    return {
      id: node.id || this.generateId('frame'),
      type: 'FrameNode',
      name: node.name,
      figmaNodeId: node.id,
      children: (node.children ?? []).map((child) => this.parseNode(child)),
      viewport: node.absoluteBoundingBox
        ? {
            width: node.absoluteBoundingBox.width,
            height: node.absoluteBoundingBox.height,
          }
        : undefined,
    };
  }

  private parseNode(node: FigmaNode): LayoutNode {
    if (node.type === 'TEXT') {
      return this.parseText(node);
    }

    if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
      return this.parseComponent(node);
    }

    if (node.children && (node.layoutMode || node.type === 'FRAME' || node.type === 'GROUP')) {
      return this.parseStack(node);
    }

    // Default: treat as a FrameNode container
    return this.parseFrame(node);
  }

  private parseStack(node: FigmaNode): StackNode {
    const al = node.autoLayout;
    const direction: Direction =
      (al?.layoutMode ?? node.layoutMode) === 'HORIZONTAL' ? 'row' : 'column';

    return {
      id: node.id || this.generateId('stack'),
      type: 'StackNode',
      name: node.name,
      figmaNodeId: node.id,
      direction,
      gap: this.mapSpacingToken(al?.itemSpacing),
      mainAxisAlign: this.mapMainAxis(al?.primaryAxisAlignItems),
      crossAxisAlign: this.mapCrossAxis(al?.counterAxisAlignItems),
      padding: {
        top: this.mapSpacingToken(al?.paddingTop),
        right: this.mapSpacingToken(al?.paddingRight),
        bottom: this.mapSpacingToken(al?.paddingBottom),
        left: this.mapSpacingToken(al?.paddingLeft),
      },
      children: (node.children ?? []).map((child) => this.parseNode(child)),
    };
  }

  private parseText(node: FigmaNode): TextNode {
    const tag = this.inferTextTag(node.fontSize);

    return {
      id: node.id || this.generateId('text'),
      type: 'TextNode',
      name: node.name,
      figmaNodeId: node.id,
      content: node.characters ?? '',
      tag,
      fontSize: node.fontSize ? this.mapTypographyToken(node.fontSize) : undefined,
      fontWeight: node.fontWeight ? `$font-weight-${this.weightName(node.fontWeight)}` as TokenRef : undefined,
      lineHeight: node.lineHeightPx ? `${node.lineHeightPx}` : undefined,
      textAlign: this.mapTextAlign(node.textAlignHorizontal),
    };
  }

  private parseComponent(node: FigmaNode): ComponentNode {
    return {
      id: node.id || this.generateId('component'),
      type: 'ComponentNode',
      name: node.name,
      figmaNodeId: node.id,
      component: this.extractComponentName(node),
      variant: this.extractVariant(node),
      children: node.children
        ? node.children.map((child) => this.parseNode(child))
        : undefined,
    };
  }

  // ─── Token Mapping Helpers ───────────────────────────────

  private mapSpacingToken(value?: number): SpacingToken | undefined {
    if (value === undefined || value === null || value === 0) {
      return undefined;
    }
    const snapped = Math.round(value / this.spacingGrid) * this.spacingGrid;
    const steps = snapped / this.spacingGrid;
    return `$space-${steps}` as SpacingToken;
  }

  private mapTypographyToken(fontSize: number): TokenRef {
    if (fontSize <= 12) return '$font-size-xs';
    if (fontSize <= 14) return '$font-size-sm';
    if (fontSize <= 16) return '$font-size-md';
    if (fontSize <= 18) return '$font-size-lg';
    if (fontSize <= 20) return '$font-size-xl';
    if (fontSize <= 24) return '$font-size-2xl';
    if (fontSize <= 30) return '$font-size-3xl';
    return '$font-size-4xl';
  }

  private weightName(weight: number): string {
    if (weight <= 400) return 'normal';
    if (weight <= 500) return 'medium';
    return 'bold';
  }

  private inferTextTag(fontSize?: number): TextNode['tag'] {
    if (!fontSize) return 'p';
    if (fontSize >= 32) return 'h1';
    if (fontSize >= 28) return 'h2';
    if (fontSize >= 24) return 'h3';
    if (fontSize >= 20) return 'h4';
    if (fontSize >= 18) return 'h5';
    if (fontSize >= 16) return 'h6';
    return 'p';
  }

  private mapMainAxis(
    alignment?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN',
  ): MainAxisAlign | undefined {
    switch (alignment) {
      case 'MIN': return 'start';
      case 'CENTER': return 'center';
      case 'MAX': return 'end';
      case 'SPACE_BETWEEN': return 'space-between';
      default: return undefined;
    }
  }

  private mapCrossAxis(
    alignment?: 'MIN' | 'CENTER' | 'MAX',
  ): CrossAxisAlign | undefined {
    switch (alignment) {
      case 'MIN': return 'start';
      case 'CENTER': return 'center';
      case 'MAX': return 'end';
      default: return undefined;
    }
  }

  private mapTextAlign(
    alignment?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED',
  ): TextNode['textAlign'] | undefined {
    switch (alignment) {
      case 'LEFT': return 'left';
      case 'CENTER': return 'center';
      case 'RIGHT': return 'right';
      case 'JUSTIFIED': return 'justify';
      default: return undefined;
    }
  }

  private extractComponentName(node: FigmaNode): string {
    if (node.componentKey) {
      const parts = node.componentKey.split('/');
      return parts[parts.length - 1] || node.name;
    }
    return node.name;
  }

  private extractVariant(node: FigmaNode): string | undefined {
    const match = node.name.match(/\[([^\]]+)\]/);
    if (match) {
      const content = match[1];
      const [, value] = content.split('=').map((s) => s.trim());
      return value;
    }
    return undefined;
  }
}
