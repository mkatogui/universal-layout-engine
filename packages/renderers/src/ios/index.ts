import type {
  IRDocument,
  FrameNode,
  StackNode,
  GridNode,
  ScrollNode,
  ComponentNode,
  TextNode,
  ImageNode,
  SpacerNode,
  LayoutNode,
} from '@mkatogui/ule-core';

import { pascalCase, camelCase, extractSpacingValue, getNodeChildren } from '../utils.js';

/**
 * iOS Renderer for Universal Layout Engine
 *
 * Converts IR layout nodes into SwiftUI code.
 * Uses `@mkatogui/ule-core` IR types exclusively.
 */
export class IosRenderer {
  /**
   * Render a complete IR document into SwiftUI code
   */
  renderDocument(doc: IRDocument): string {
    const frames = doc.frames
      .map((frame) => this.renderNode(frame))
      .join('\n\n');

    return `import SwiftUI

struct GeneratedView: View {
  var body: some View {
    ${frames}
  }
}

#Preview {
  GeneratedView()
}`;
  }

  /**
   * Render a single IR node into SwiftUI code
   */
  renderNode(node: LayoutNode): string {
    switch (node.type) {
      case 'FrameNode':
        return this.renderFrame(node);
      case 'StackNode':
        return this.renderStack(node);
      case 'GridNode':
        return this.renderGrid(node);
      case 'ScrollNode':
        return this.renderScroll(node);
      case 'ComponentNode':
        return this.renderComponent(node);
      case 'TextNode':
        return this.renderText(node);
      case 'ImageNode':
        return this.renderImage(node);
      case 'SpacerNode':
        return this.renderSpacer(node);
      default:
        return `// Unsupported node type: ${node.type}`;
    }
  }

  private renderFrame(node: FrameNode): string {
    const children = node.children.map((child) => this.renderNode(child)).join('\n      ');
    return `VStack(spacing: 0) {
      ${children}
    }`;
  }

  private renderStack(node: StackNode): string {
    const stackType = node.direction === 'row' ? 'HStack' : 'VStack';
    const spacing = node.gap ? extractSpacingValue(String(node.gap)) : 0;
    const alignment = this.mapAlignment(node.crossAxisAlign);
    const alignmentArg = alignment ? `, alignment: .${alignment}` : '';

    const children = node.children.map((child) => this.renderNode(child)).join('\n      ');

    return `${stackType}(spacing: ${spacing}${alignmentArg}) {
      ${children}
    }`;
  }

  private renderGrid(node: GridNode): string {
    const children = node.children.map((child) => this.renderNode(child)).join('\n      ');
    return `LazyVGrid(columns: [GridItem(.flexible())]) {
      ${children}
    }`;
  }

  private renderScroll(node: ScrollNode): string {
    const axis = node.direction === 'horizontal' ? '.horizontal' : '.vertical';
    const children = node.children.map((child) => this.renderNode(child)).join('\n      ');
    return `ScrollView(${axis}) {
      ${children}
    }`;
  }

  private renderComponent(node: ComponentNode): string {
    const name = pascalCase(node.component);
    if (node.variant) {
      return `${name}(variant: .${camelCase(node.variant)})`;
    }
    return `${name}()`;
  }

  private renderText(node: TextNode): string {
    const content = JSON.stringify(node.content);
    let textCode = `Text(${content})`;

    if (node.fontSize) {
      const size = extractSpacingValue(String(node.fontSize)) || 16;
      const weight = node.fontWeight ? this.mapFontWeight(String(node.fontWeight)) : '.regular';
      textCode += `\n      .font(.system(size: ${size}, weight: ${weight}))`;
    }

    if (node.textAlign && node.textAlign !== 'left') {
      textCode += `\n      .multilineTextAlignment(.${this.mapTextAlignment(node.textAlign)})`;
    }

    return textCode;
  }

  private renderImage(node: ImageNode): string {
    let imageCode = `Image("${node.src}")`;

    if (node.fit === 'cover') {
      imageCode += '\n      .resizable()\n      .scaledToFill()';
    } else if (node.fit === 'contain') {
      imageCode += '\n      .resizable()\n      .scaledToFit()';
    } else {
      imageCode += '\n      .resizable()';
    }

    imageCode += `\n      .accessibilityLabel(${JSON.stringify(node.alt)})`;

    return imageCode;
  }

  private renderSpacer(node: SpacerNode): string {
    if (node.fixedSize) {
      const size = extractSpacingValue(String(node.fixedSize));
      return `Spacer()\n      .frame(width: ${size}, height: ${size})`;
    }
    return 'Spacer()';
  }

  private mapAlignment(align?: string): string | undefined {
    switch (align) {
      case 'start': return 'leading';
      case 'center': return 'center';
      case 'end': return 'trailing';
      default: return undefined;
    }
  }

  private mapTextAlignment(align: string): string {
    switch (align) {
      case 'center': return 'center';
      case 'right': return 'trailing';
      default: return 'leading';
    }
  }

  private mapFontWeight(weight: string): string {
    if (weight.includes('bold') || weight === '700') return '.bold';
    if (weight.includes('medium') || weight === '500') return '.medium';
    return '.regular';
  }
}
