import type {
  StackNode,
  GridNode,
  ComponentNode,
  TextNode,
  ImageNode,
  SpacerNode,
  ConditionalNode,
  ContainerNode,
  LayoutNode,
} from '@mkatogui/ule-core';

/**
 * Web Renderer for Universal Layout Engine
 *
 * Converts IR layout nodes into React + UDS (Universal Design System) code.
 * Generates JSX components with proper styling using design tokens and
 * CSS custom properties.
 *
 * @example
 * ```ts
 * const renderer = new WebRenderer();
 * const files = renderer.renderDocument(irDocument);
 * for (const [filename, content] of files) {
 *   console.log(`${filename}:`);
 *   console.log(content);
 * }
 * ```
 */
export class WebRenderer {
  private imports: Set<string> = new Set();
  private componentCount = 0;

  /**
   * Render a complete IR document into React files
   *
   * @param doc IR document to render
   * @returns Map of filename → file content
   */
  renderDocument(doc: any): Map<string, string> {
    this.imports.clear();
    this.componentCount = 0;

    const files = new Map<string, string>();

    // Render main component
    const mainContent = this.renderNode(doc.root);
    const mainFile = this.wrapWithImports(mainContent);
    files.set('main.tsx', mainFile);

    return files;
  }

  /**
   * Render a single IR node into JSX
   *
   * @param node Layout node to render
   * @returns JSX string
   */
  renderNode(node: LayoutNode): string {
    switch (node.type) {
      case 'stack':
        return this.renderStack(node as StackNode);
      case 'grid':
        return this.renderGrid(node as GridNode);
      case 'component':
        return this.renderComponent(node as ComponentNode);
      case 'text':
        return this.renderText(node as TextNode);
      case 'image':
        return this.renderImage(node as ImageNode);
      case 'spacer':
        return this.renderSpacer(node as SpacerNode);
      case 'conditional':
        return this.renderConditional(node as ConditionalNode);
      case 'container':
        return this.renderContainer(node as ContainerNode);
      default:
        return '/* Unknown node type */';
    }
  }

  /**
   * Render a StackNode as a flex container
   * @private
   */
  private renderStack(node: StackNode): string {
    const className = this.generateClassName('stack');
    const style = this.generateStackStyle(node);
    const children = node.children.map((child) => this.renderNode(child)).join('\n  ');

    return `<div className="${className}" style={${JSON.stringify(style)}} data-testid="${node.id}">
  ${children}
</div>`;
  }

  /**
   * Render a GridNode as a CSS grid container
   * @private
   */
  private renderGrid(node: GridNode): string {
    const className = this.generateClassName('grid');
    const style = this.generateGridStyle(node);
    const children = node.children.map((child) => this.renderNode(child)).join('\n  ');

    return `<div className="${className}" style={${JSON.stringify(style)}} data-testid="${node.id}">
  ${children}
</div>`;
  }

  /**
   * Render a ComponentNode as a UDS component
   * @private
   */
  private renderComponent(node: ComponentNode): string {
    const componentName = this.pascalCase(node.componentName);
    this.imports.add(`import { ${componentName} } from '@mkatogui/uds-react';`);

    const props = this.generateComponentProps(node);
    const propString = Object.entries(props)
      .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
      .join(' ');

    if (node.children && node.children.length > 0) {
      const childrenJsx = node.children.map((child) => this.renderNode(child)).join('\n  ');
      return `<${componentName} ${propString} data-testid="${node.id}">
  ${childrenJsx}
</${componentName}>`;
    }

    return `<${componentName} ${propString} data-testid="${node.id}" />`;
  }

  /**
   * Render a TextNode as semantic HTML
   * @private
   */
  private renderText(node: TextNode): string {
    const tag = node.variant || 'span';
    const className = this.generateClassName(`text--${node.variant}`);
    const style = this.generateTextStyle(node);

    const styleAttr = Object.keys(style).length > 0 ? ` style={${JSON.stringify(style)}}` : '';

    return `<${tag} className="${className}"${styleAttr} data-testid="${node.id}">
  {${JSON.stringify(node.content)}}
</${tag}>`;
  }

  /**
   * Render an ImageNode as an img element
   * @private
   */
  private renderImage(node: ImageNode): string {
    const src = node.src || '';
    const alt = node.alt || node.name;
    const style = this.generateImageStyle(node);

    const styleAttr = Object.keys(style).length > 0 ? ` style={${JSON.stringify(style)}}` : '';

    return `<img
  src="${src}"
  alt="${alt}"
  className="ule-image"${styleAttr}
  data-testid="${node.id}"
/>`;
  }

  /**
   * Render a SpacerNode as a flexible spacer
   * @private
   */
  private renderSpacer(node: SpacerNode): string {
    const style = this.generateSpacerStyle(node);
    return `<div className="ule-spacer" style={${JSON.stringify(style)}} data-testid="${node.id}" />`;
  }

  /**
   * Render a ConditionalNode with media queries
   * @private
   */
  private renderConditional(node: ConditionalNode): string {
    // Use a hook-like pattern for conditional rendering
    return `{/* Conditional: ${node.condition} */}
{useMediaQuery('${node.condition}') && (
  ${this.renderNode(node.trueNode)}
)}
${node.falseNode ? `{!useMediaQuery('${node.condition}') && (
  ${this.renderNode(node.falseNode)}
)}` : ''}`;
  }

  /**
   * Render a ContainerNode
   * @private
   */
  private renderContainer(node: ContainerNode): string {
    const className = this.generateClassName('container');
    const style = this.generateContainerStyle(node);
    const children = node.children.map((child) => this.renderNode(child)).join('\n  ');

    return `<div className="${className}" style={${JSON.stringify(style)}} data-testid="${node.id}">
  ${children}
</div>`;
  }

  /**
   * Generate style object for StackNode
   * @private
   */
  private generateStackStyle(node: StackNode): Record<string, any> {
    return {
      display: 'flex',
      flexDirection: node.direction === 'row' ? 'row' : 'column',
      gap: node.gap ? `var(${node.gap})` : undefined,
      alignItems: node.alignItems ? this.mapAlignItems(node.alignItems) : undefined,
      justifyContent: node.justifyContent
        ? this.mapJustifyContent(node.justifyContent)
        : undefined,
      ...this.generatePaddingStyle(node.padding),
    };
  }

  /**
   * Generate style object for GridNode
   * @private
   */
  private generateGridStyle(node: GridNode): Record<string, any> {
    let gridTemplate = '';

    if (Array.isArray(node.columns)) {
      gridTemplate = node.columns.join(' ');
    } else if (typeof node.columns === 'number') {
      gridTemplate = `repeat(${node.columns}, 1fr)`;
    }

    return {
      display: 'grid',
      gridTemplateColumns: gridTemplate || undefined,
      gap: node.gap ? `var(${node.gap})` : undefined,
      ...this.generatePaddingStyle(node.padding),
    };
  }

  /**
   * Generate style object for TextNode
   * @private
   */
  private generateTextStyle(node: TextNode): Record<string, any> {
    return {
      fontSize: node.fontSize ? `var(--font-size-${node.fontSize})` : undefined,
      fontWeight: node.fontWeight,
      lineHeight: node.lineHeight ? `var(--line-height-${node.lineHeight})` : undefined,
      letterSpacing: node.letterSpacing,
      textAlign: node.textAlign,
      color: node.color ? `var(${node.color})` : undefined,
    };
  }

  /**
   * Generate style object for ImageNode
   * @private
   */
  private generateImageStyle(node: ImageNode): Record<string, any> {
    return {
      width: node.width,
      height: node.height,
      objectFit: node.objectFit,
    };
  }

  /**
   * Generate style object for SpacerNode
   * @private
   */
  private generateSpacerStyle(node: SpacerNode): Record<string, any> {
    return {
      flex: node.flex || '1',
      width: node.width,
      height: node.height,
    };
  }

  /**
   * Generate style object for ContainerNode
   * @private
   */
  private generateContainerStyle(node: ContainerNode): Record<string, any> {
    return {
      width: node.width,
      height: node.height,
      ...this.generatePaddingStyle(node.padding),
    };
  }

  /**
   * Generate padding style from padding object
   * @private
   */
  private generatePaddingStyle(padding?: Record<string, string | undefined>): Record<string, string> {
    if (!padding) return {};

    return {
      paddingTop: padding.top ? `var(${padding.top})` : undefined,
      paddingRight: padding.right ? `var(${padding.right})` : undefined,
      paddingBottom: padding.bottom ? `var(${padding.bottom})` : undefined,
      paddingLeft: padding.left ? `var(${padding.left})` : undefined,
    };
  }

  /**
   * Generate component props from ComponentNode
   * @private
   */
  private generateComponentProps(node: ComponentNode): Record<string, any> {
    const props: Record<string, any> = {};

    if (node.componentVariant) {
      for (const [key, value] of Object.entries(node.componentVariant)) {
        props[this.camelCase(key)] = value;
      }
    }

    if (node.props) {
      Object.assign(props, node.props);
    }

    return props;
  }

  /**
   * Generate className using BEM convention
   * @private
   */
  private generateClassName(blockName: string): string {
    return `ule__${blockName}`;
  }

  /**
   * Map alignment value to CSS alignItems
   * @private
   */
  private mapAlignItems(align: string): string {
    switch (align) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'space-between':
        return 'space-between';
      default:
        return align;
    }
  }

  /**
   * Map alignment value to CSS justifyContent
   * @private
   */
  private mapJustifyContent(align: string): string {
    switch (align) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'space-between':
        return 'space-between';
      default:
        return align;
    }
  }

  /**
   * Convert string to PascalCase
   * @private
   */
  private pascalCase(str: string): string {
    return str
      .replace(/[\s\-_]+/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Convert string to camelCase
   * @private
   */
  private camelCase(str: string): string {
    return str
      .replace(/[\s\-_]+/g, ' ')
      .split(' ')
      .map((word, index) =>
        index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join('');
  }

  /**
   * Wrap rendered content with necessary imports
   * @private
   */
  private wrapWithImports(content: string): string {
    const importLines = Array.from(this.imports).join('\n');
    const hasConditional = content.includes('useMediaQuery');

    let imports = importLines;
    if (hasConditional) {
      imports += '\nimport { useMediaQuery } from "@mkatogui/uds-react";';
    }

    return `'use client';

${imports}

export default function GeneratedComponent() {
  return (
    ${content}
  );
}`;
  }
}
