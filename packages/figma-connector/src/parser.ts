import type {
  FigmaNode,
  FigmaAutoLayout,
  FigmaConstraint,
  FigmaNodeType,
} from './rest/types.js';

/**
 * Intermediate Representation (IR) Layout Node Types
 * These represent a normalized, platform-agnostic layout structure
 */

export type LayoutNode =
  | StackNode
  | GridNode
  | ComponentNode
  | TextNode
  | ImageNode
  | SpacerNode
  | ConditionalNode
  | ContainerNode;

export interface BaseLayoutNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  locked?: boolean;
}

export interface StackNode extends BaseLayoutNode {
  type: 'stack';
  direction: 'row' | 'column';
  gap?: string;
  padding?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  alignItems?: 'start' | 'center' | 'end' | 'space-between';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between';
  wrap?: boolean;
  children: LayoutNode[];
}

export interface GridNode extends BaseLayoutNode {
  type: 'grid';
  columns?: number | string[];
  rows?: number | string[];
  gap?: string;
  padding?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  children: LayoutNode[];
}

export interface ComponentNode extends BaseLayoutNode {
  type: 'component';
  componentName: string;
  componentVariant?: Record<string, string>;
  props?: Record<string, any>;
  children?: LayoutNode[];
}

export interface TextNode extends BaseLayoutNode {
  type: 'text';
  content: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
}

export interface ImageNode extends BaseLayoutNode {
  type: 'image';
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
}

export interface SpacerNode extends BaseLayoutNode {
  type: 'spacer';
  flex?: number | string;
  width?: string;
  height?: string;
}

export interface ConditionalNode extends BaseLayoutNode {
  type: 'conditional';
  condition: string;
  trueNode: LayoutNode;
  falseNode?: LayoutNode;
}

export interface ContainerNode extends BaseLayoutNode {
  type: 'container';
  width?: string;
  height?: string;
  padding?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  children: LayoutNode[];
}

/**
 * Figma Layout Parser
 *
 * Converts Figma design nodes into an Intermediate Representation (IR)
 * that can be rendered to multiple platforms (Web, iOS, Android, Desktop).
 *
 * @example
 * ```ts
 * const parser = new FigmaLayoutParser();
 * const irTree = parser.parse(figmaNode);
 * ```
 */
export class FigmaLayoutParser {
  private readonly spacingGrid = 4; // px
  private readonly tokenPrefix = '$space-';

  /**
   * Parse a Figma node tree into IR layout nodes
   *
   * @param node Root Figma node to parse
   * @returns IR LayoutNode tree
   */
  parse(node: FigmaNode): LayoutNode {
    return this.parseNode(node);
  }

  /**
   * Parse a single Figma node into an IR layout node
   * @private
   */
  private parseNode(node: FigmaNode): LayoutNode {
    // Delegate to specialized parsers based on node type
    if (node.children && (node.layoutMode || node.type === 'FRAME' || node.type === 'GROUP')) {
      return this.parseStack(node);
    }

    if (node.type === 'TEXT') {
      return this.parseText(node);
    }

    if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
      return this.parseComponent(node);
    }

    // Default: create a container
    return this.parseContainer(node);
  }

  /**
   * Parse a stack/layout node
   * @private
   */
  private parseStack(node: FigmaNode): StackNode {
    const autoLayout = node.autoLayout || { layoutMode: node.layoutMode };

    return {
      id: node.id,
      name: node.name,
      type: 'stack',
      direction: autoLayout?.layoutMode === 'HORIZONTAL' ? 'row' : 'column',
      gap: this.mapSpacingToken(autoLayout?.itemSpacing),
      padding: {
        top: this.mapSpacingToken(autoLayout?.paddingTop),
        right: this.mapSpacingToken(autoLayout?.paddingRight),
        bottom: this.mapSpacingToken(autoLayout?.paddingBottom),
        left: this.mapSpacingToken(autoLayout?.paddingLeft),
      },
      alignItems: this.mapAlignment(autoLayout?.counterAxisAlignItems),
      justifyContent: this.mapAlignment(autoLayout?.primaryAxisAlignItems),
      visible: node.visible !== false,
      children: (node.children || []).map((child) => this.parseNode(child)),
    };
  }

  /**
   * Parse a text node
   * @private
   */
  private parseText(node: FigmaNode): TextNode {
    // Determine text variant based on font size
    let variant: TextNode['variant'] = 'span';
    if (node.fontSize) {
      if (node.fontSize >= 32) variant = 'h1';
      else if (node.fontSize >= 28) variant = 'h2';
      else if (node.fontSize >= 24) variant = 'h3';
      else if (node.fontSize >= 20) variant = 'h4';
      else if (node.fontSize >= 16) variant = 'h5';
      else if (node.fontSize >= 14) variant = 'h6';
      else if (node.fontSize >= 12) variant = 'p';
    }

    return {
      id: node.id,
      name: node.name,
      type: 'text',
      content: node.characters || '',
      variant,
      fontSize: node.fontSize ? `${node.fontSize}px` : undefined,
      fontWeight: node.fontWeight ? String(node.fontWeight) : undefined,
      lineHeight: node.lineHeightPx ? `${node.lineHeightPx}px` : undefined,
      letterSpacing: node.letterSpacing?.value
        ? `${node.letterSpacing.value}${node.letterSpacing.unit === 'PERCENT' ? '%' : 'px'}`
        : undefined,
      textAlign: this.mapTextAlign(node.textAlignHorizontal),
      visible: node.visible !== false,
    };
  }

  /**
   * Parse a component instance or main component
   * @private
   */
  private parseComponent(node: FigmaNode): ComponentNode {
    return {
      id: node.id,
      name: node.name,
      type: 'component',
      componentName: this.extractComponentName(node),
      componentVariant: this.extractComponentVariant(node),
      visible: node.visible !== false,
      children: node.children ? node.children.map((child) => this.parseNode(child)) : undefined,
    };
  }

  /**
   * Parse a generic container
   * @private
   */
  private parseContainer(node: FigmaNode): ContainerNode {
    return {
      id: node.id,
      name: node.name,
      type: 'container',
      width: node.absoluteBoundingBox?.width ? `${node.absoluteBoundingBox.width}px` : undefined,
      height: node.absoluteBoundingBox?.height ? `${node.absoluteBoundingBox.height}px` : undefined,
      visible: node.visible !== false,
      children: node.children ? node.children.map((child) => this.parseNode(child)) : [],
    };
  }

  /**
   * Map Figma spacing value to design token
   * @private
   */
  private mapSpacingToken(value?: number): string | undefined {
    if (value === undefined || value === null || value === 0) {
      return undefined;
    }

    // Snap to nearest spacing grid (4px)
    const snapped = Math.round(value / this.spacingGrid) * this.spacingGrid;
    const tokenValue = snapped / this.spacingGrid;

    return `${this.tokenPrefix}${tokenValue}`;
  }

  /**
   * Map Figma alignment to IR alignment
   * @private
   */
  private mapAlignment(
    alignment?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN',
  ): LayoutNode['alignItems'] | undefined {
    switch (alignment) {
      case 'MIN':
        return 'start';
      case 'CENTER':
        return 'center';
      case 'MAX':
        return 'end';
      case 'SPACE_BETWEEN':
        return 'space-between';
      default:
        return undefined;
    }
  }

  /**
   * Map Figma text alignment to IR text alignment
   * @private
   */
  private mapTextAlign(
    alignment?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED',
  ): TextNode['textAlign'] | undefined {
    switch (alignment) {
      case 'LEFT':
        return 'left';
      case 'CENTER':
        return 'center';
      case 'RIGHT':
        return 'right';
      case 'JUSTIFIED':
        return 'justify';
      default:
        return undefined;
    }
  }

  /**
   * Extract component name from node
   * @private
   */
  private extractComponentName(node: FigmaNode): string {
    if (node.componentKey) {
      const parts = node.componentKey.split('/');
      return parts[parts.length - 1] || node.name;
    }
    return node.name;
  }

  /**
   * Extract component variants from node name
   * @private
   */
  private extractComponentVariant(node: FigmaNode): Record<string, string> | undefined {
    const name = node.name;
    const variantMatch = name.match(/\[([^\]]+)\]/g);

    if (!variantMatch) {
      return undefined;
    }

    const variants: Record<string, string> = {};
    for (const match of variantMatch) {
      const content = match.slice(1, -1);
      const [key, value] = content.split('=').map((s) => s.trim());
      if (key && value) {
        variants[key] = value;
      }
    }

    return Object.keys(variants).length > 0 ? variants : undefined;
  }
}
