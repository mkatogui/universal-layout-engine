import type {
  StackNode,
  ComponentNode,
  TextNode,
  ImageNode,
  SpacerNode,
  ContainerNode,
  LayoutNode,
} from '@mkatogui/ule-core';

/**
 * iOS Renderer for Universal Layout Engine
 *
 * Converts IR layout nodes into SwiftUI code for iOS applications.
 * Generates SwiftUI View hierarchies with proper styling and component usage.
 *
 * @example
 * ```ts
 * const renderer = new IosRenderer();
 * const swiftCode = renderer.renderDocument(irDocument);
 * ```
 */
export class IosRenderer {
  /**
   * Render a complete IR document into SwiftUI code
   *
   * @param doc IR document to render
   * @returns SwiftUI View code as string
   */
  renderDocument(doc: any): string {
    const viewCode = this.renderNode(doc.root);

    return `import SwiftUI

struct GeneratedView: View {
  var body: some View {
    ${viewCode}
  }
}

#Preview {
  GeneratedView()
}`;
  }

  /**
   * Render a single IR node into SwiftUI code
   *
   * @param node Layout node to render
   * @returns SwiftUI code string
   */
  renderNode(node: LayoutNode): string {
    switch (node.type) {
      case 'stack':
        return this.renderStack(node as StackNode);
      case 'component':
        return this.renderComponent(node as ComponentNode);
      case 'text':
        return this.renderText(node as TextNode);
      case 'image':
        return this.renderImage(node as ImageNode);
      case 'spacer':
        return this.renderSpacer(node as SpacerNode);
      case 'container':
        return this.renderContainer(node as ContainerNode);
      default:
        return '// Unknown node type';
    }
  }

  /**
   * Render a StackNode as HStack or VStack
   * @private
   */
  private renderStack(node: StackNode): string {
    const stackType = node.direction === 'row' ? 'HStack' : 'VStack';
    const spacing = node.gap ? this.extractSpacingValue(node.gap) : '0';
    const childrenCode = node.children.map((child) => this.renderNode(child)).join('\n    ');
    const alignment = this.mapAlignment(node.alignItems);

    const alignmentArg = alignment ? `, alignment: .${alignment}` : '';

    return `${stackType}(spacing: ${spacing}${alignmentArg}) {
      ${childrenCode}
    }`;
  }

  /**
   * Render a ComponentNode as a SwiftUI component
   * @private
   */
  private renderComponent(node: ComponentNode): string {
    const componentName = this.pascalCase(node.componentName);

    if (node.componentVariant && Object.keys(node.componentVariant).length > 0) {
      const variantString = Object.entries(node.componentVariant)
        .map(([key, value]) => `${this.camelCase(key)}: .${value}`)
        .join(', ');

      return `${componentName}(${variantString})`;
    }

    return `${componentName}()`;
  }

  /**
   * Render a TextNode as SwiftUI Text view
   * @private
   */
  private renderText(node: TextNode): string {
    const content = JSON.stringify(node.content);
    const fontSize = node.fontSize ? `.system(size: ${this.extractPixelValue(node.fontSize)})` : '.body';
    const fontWeight = node.fontWeight ? `.${this.mapFontWeight(node.fontWeight)}` : '.regular';

    let textCode = `Text(${content})`;

    if (node.fontSize) {
      textCode += `\n      .font(.system(size: ${this.extractPixelValue(node.fontSize)}, weight: ${fontWeight}))`;
    }

    if (node.textAlign && node.textAlign !== 'left') {
      const alignment = this.mapTextAlignment(node.textAlign);
      textCode += `\n      .multilineTextAlignment(.${alignment})`;
    }

    return textCode;
  }

  /**
   * Render an ImageNode as SwiftUI Image view
   * @private
   */
  private renderImage(node: ImageNode): string {
    let imageCode = `Image("${node.src || 'placeholder'}")`;

    if (node.objectFit === 'cover') {
      imageCode += '\n      .resizable()\n      .scaledToFill()';
    } else if (node.objectFit === 'contain') {
      imageCode += '\n      .resizable()\n      .scaledToFit()';
    } else {
      imageCode += '\n      .resizable()';
    }

    if (node.width && node.height) {
      const w = this.extractPixelValue(node.width);
      const h = this.extractPixelValue(node.height);
      imageCode += `\n      .frame(width: ${w}, height: ${h})`;
    }

    return imageCode;
  }

  /**
   * Render a SpacerNode as SwiftUI Spacer
   * @private
   */
  private renderSpacer(node: SpacerNode): string {
    if (node.width && node.height) {
      const w = this.extractPixelValue(node.width);
      const h = this.extractPixelValue(node.height);
      return `Spacer()\n      .frame(width: ${w}, height: ${h})`;
    }

    if (node.flex) {
      return `Spacer()`;
    }

    return `Spacer()`;
  }

  /**
   * Render a ContainerNode as a basic VStack
   * @private
   */
  private renderContainer(node: ContainerNode): string {
    const childrenCode = node.children.map((child) => this.renderNode(child)).join('\n    ');

    let containerCode = `VStack {
      ${childrenCode}
    }`;

    if (node.width || node.height) {
      const w = node.width ? this.extractPixelValue(node.width) : 'nil';
      const h = node.height ? this.extractPixelValue(node.height) : 'nil';
      containerCode += `\n    .frame(width: ${w}, height: ${h})`;
    }

    return containerCode;
  }

  /**
   * Map alignment value to SwiftUI alignment
   * @private
   */
  private mapAlignment(align?: string): string | undefined {
    switch (align) {
      case 'start':
        return 'leading';
      case 'center':
        return 'center';
      case 'end':
        return 'trailing';
      default:
        return undefined;
    }
  }

  /**
   * Map text alignment to SwiftUI TextAlignment
   * @private
   */
  private mapTextAlignment(align: string): string {
    switch (align) {
      case 'center':
        return 'center';
      case 'right':
        return 'trailing';
      case 'justify':
        return 'center'; // SwiftUI doesn't have justify
      default:
        return 'leading';
    }
  }

  /**
   * Map font weight value
   * @private
   */
  private mapFontWeight(weight: string | number): string {
    const w = Number(weight);
    if (w <= 400) return 'light';
    if (w <= 600) return 'regular';
    if (w <= 700) return 'semibold';
    return 'bold';
  }

  /**
   * Extract pixel value from string (e.g., "16px" → 16)
   * @private
   */
  private extractPixelValue(value: string): number {
    return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  }

  /**
   * Extract spacing value from token (e.g., "$space-4" → 16)
   * @private
   */
  private extractSpacingValue(token: string): number {
    const match = token.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10) * 4; // 4px grid
    }
    return 0;
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
}
