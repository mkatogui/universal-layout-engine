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
 * Android Renderer for Universal Layout Engine
 *
 * Converts IR layout nodes into Jetpack Compose code for Android applications.
 * Generates Compose function hierarchies with proper styling and component usage.
 *
 * @example
 * ```ts
 * const renderer = new AndroidRenderer();
 * const composeCode = renderer.renderDocument(irDocument);
 * ```
 */
export class AndroidRenderer {
  /**
   * Render a complete IR document into Jetpack Compose code
   *
   * @param doc IR document to render
   * @returns Compose function code as string
   */
  renderDocument(doc: any): string {
    const composeCode = this.renderNode(doc.root);

    return `package com.example.generated.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun GeneratedComponent() {
  ${composeCode}
}

@Composable
fun GeneratedComponentPreview() {
  GeneratedComponent()
}`;
  }

  /**
   * Render a single IR node into Compose code
   *
   * @param node Layout node to render
   * @returns Compose code string
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
   * Render a StackNode as Row or Column
   * @private
   */
  private renderStack(node: StackNode): string {
    const composable = node.direction === 'row' ? 'Row' : 'Column';
    const spacing = node.gap ? this.extractSpacingValue(node.gap) : '0';
    const alignment = this.mapAlignment(node.alignItems);
    const horizontalAlignment = this.mapHorizontalAlignment(node.alignItems);

    const childrenCode = node.children
      .map((child) => {
        const code = this.renderNode(child);
        return code;
      })
      .join(',\n    ');

    let modifiers = `Modifier
      .fillMaxWidth()
      .padding(${spacing}.dp)`;

    if (alignment) {
      modifiers += `\n      .${alignment}`;
    }

    const horizontalArg =
      node.direction === 'row' && horizontalAlignment
        ? `, horizontalArrangement = Arrangement.${horizontalAlignment}`
        : '';
    const verticalArg =
      node.direction === 'column' && horizontalAlignment
        ? `, verticalAlignment = Alignment.${horizontalAlignment}`
        : '';

    return `${composable}(
      modifier = ${modifiers}${horizontalArg}${verticalArg}
    ) {
      ${childrenCode}
    }`;
  }

  /**
   * Render a ComponentNode as a Compose component
   * @private
   */
  private renderComponent(node: ComponentNode): string {
    const componentName = this.pascalCase(node.componentName);

    if (node.componentVariant && Object.keys(node.componentVariant).length > 0) {
      const args = Object.entries(node.componentVariant)
        .map(([key, value]) => `${this.camelCase(key)} = "${value}"`)
        .join(', ');

      return `${componentName}(${args})`;
    }

    return `${componentName}()`;
  }

  /**
   * Render a TextNode as Compose Text
   * @private
   */
  private renderText(node: TextNode): string {
    const content = JSON.stringify(node.content);
    const fontSize = node.fontSize ? this.extractPixelValue(node.fontSize) : '14';

    let textCode = `Text(
      text = ${content},
      fontSize = ${fontSize}.sp`;

    if (node.fontWeight) {
      const weight = this.mapFontWeight(node.fontWeight);
      textCode += `,\n      fontWeight = FontWeight.${weight}`;
    }

    if (node.textAlign && node.textAlign !== 'left') {
      const align = this.mapTextAlignment(node.textAlign);
      textCode += `,\n      textAlign = TextAlign.${align}`;
    }

    textCode += '\n    )';

    return textCode;
  }

  /**
   * Render an ImageNode as Compose Image
   * @private
   */
  private renderImage(node: ImageNode): string {
    const contentDescription = JSON.stringify(node.alt || node.name);

    let imageCode = `Image(
      painter = painterResource(id = R.drawable.${node.src || 'placeholder'}),
      contentDescription = ${contentDescription},
      modifier = Modifier`;

    if (node.objectFit === 'cover') {
      imageCode += '\n        .fillMaxWidth()\n        .height(200.dp)\n        .clip(RoundedCornerShape(8.dp))';
    } else if (node.objectFit === 'contain') {
      imageCode += '\n        .fillMaxWidth()\n        .padding(16.dp)';
    }

    if (node.width && node.height) {
      const w = this.extractPixelValue(node.width);
      const h = this.extractPixelValue(node.height);
      imageCode += `\n        .width(${w}.dp)\n        .height(${h}.dp)`;
    }

    imageCode += ',\n      contentScale = ContentScale.Crop\n    )';

    return imageCode;
  }

  /**
   * Render a SpacerNode as Compose Spacer
   * @private
   */
  private renderSpacer(node: SpacerNode): string {
    const height = node.height ? this.extractPixelValue(node.height) : '8';

    return `Spacer(modifier = Modifier.height(${height}.dp))`;
  }

  /**
   * Render a ContainerNode as a Column
   * @private
   */
  private renderContainer(node: ContainerNode): string {
    const childrenCode = node.children
      .map((child) => this.renderNode(child))
      .join(',\n    ');

    let modifiers = 'Modifier.fillMaxWidth()';

    if (node.width) {
      const w = this.extractPixelValue(node.width);
      modifiers += `\n      .width(${w}.dp)`;
    }

    if (node.height) {
      const h = this.extractPixelValue(node.height);
      modifiers += `\n      .height(${h}.dp)`;
    }

    return `Column(
      modifier = ${modifiers}
    ) {
      ${childrenCode}
    }`;
  }

  /**
   * Map alignment value to Compose alignment
   * @private
   */
  private mapAlignment(align?: string): string | undefined {
    switch (align) {
      case 'center':
        return 'align(Alignment.Center)';
      default:
        return undefined;
    }
  }

  /**
   * Map horizontal alignment for Row/Column
   * @private
   */
  private mapHorizontalAlignment(align?: string): string | undefined {
    switch (align) {
      case 'start':
        return 'Start';
      case 'center':
        return 'Center';
      case 'end':
        return 'End';
      case 'space-between':
        return 'SpaceBetween';
      default:
        return undefined;
    }
  }

  /**
   * Map text alignment to Compose TextAlign
   * @private
   */
  private mapTextAlignment(align: string): string {
    switch (align) {
      case 'center':
        return 'Center';
      case 'right':
        return 'Right';
      case 'justify':
        return 'Justify';
      default:
        return 'Left';
    }
  }

  /**
   * Map font weight value
   * @private
   */
  private mapFontWeight(weight: string | number): string {
    const w = Number(weight);
    if (w <= 400) return 'Light';
    if (w <= 500) return 'Medium';
    if (w <= 600) return 'SemiBold';
    if (w <= 700) return 'Bold';
    return 'ExtraBold';
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
