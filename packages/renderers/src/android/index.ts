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
 * Android Renderer for Universal Layout Engine
 *
 * Converts IR layout nodes into Jetpack Compose code.
 * Uses `@mkatogui/ule-core` IR types exclusively.
 */
export class AndroidRenderer {
  /**
   * Render a complete IR document into Jetpack Compose code
   */
  renderDocument(doc: IRDocument): string {
    const frames = doc.frames
      .map((frame) => this.renderNode(frame))
      .join('\n\n');

    return `package com.example.generated.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun GeneratedLayout() {
  ${frames}
}`;
  }

  /**
   * Render a single IR node into Compose code
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
    return `Column(
      modifier = Modifier.fillMaxWidth()
    ) {
      ${children}
    }`;
  }

  private renderStack(node: StackNode): string {
    const composable = node.direction === 'row' ? 'Row' : 'Column';
    const spacing = node.gap ? extractSpacingValue(String(node.gap)) : 0;
    const children = node.children.map((child) => this.renderNode(child)).join('\n      ');

    const arrangement = node.mainAxisAlign
      ? this.mapArrangement(node.mainAxisAlign)
      : undefined;
    const arrangementArg = arrangement
      ? `,\n      ${node.direction === 'row' ? 'horizontalArrangement' : 'verticalArrangement'} = Arrangement.${arrangement}`
      : '';

    return `${composable}(
      modifier = Modifier.fillMaxWidth().padding(${spacing}.dp)${arrangementArg}
    ) {
      ${children}
    }`;
  }

  private renderGrid(node: GridNode): string {
    const children = node.children.map((child) => this.renderNode(child)).join('\n      ');
    return `LazyVerticalGrid(
      columns = GridCells.Adaptive(minSize = 128.dp),
      modifier = Modifier.fillMaxWidth()
    ) {
      ${children}
    }`;
  }

  private renderScroll(node: ScrollNode): string {
    const modifier = node.direction === 'horizontal'
      ? 'Modifier.horizontalScroll(rememberScrollState())'
      : 'Modifier.verticalScroll(rememberScrollState())';
    const children = node.children.map((child) => this.renderNode(child)).join('\n      ');
    return `Column(modifier = ${modifier}) {
      ${children}
    }`;
  }

  private renderComponent(node: ComponentNode): string {
    const name = pascalCase(node.component);
    if (node.variant) {
      return `${name}(variant = "${node.variant}")`;
    }
    return `${name}()`;
  }

  private renderText(node: TextNode): string {
    const content = JSON.stringify(node.content);
    let code = `Text(\n      text = ${content}`;

    if (node.fontSize) {
      const size = extractSpacingValue(String(node.fontSize)) || 14;
      code += `,\n      fontSize = ${size}.sp`;
    }

    if (node.fontWeight) {
      const weight = this.mapFontWeight(String(node.fontWeight));
      code += `,\n      fontWeight = FontWeight.${weight}`;
    }

    if (node.textAlign && node.textAlign !== 'left') {
      code += `,\n      textAlign = TextAlign.${this.mapTextAlignment(node.textAlign)}`;
    }

    code += '\n    )';
    return code;
  }

  private renderImage(node: ImageNode): string {
    const contentDescription = JSON.stringify(node.alt);
    return `Image(
      painter = painterResource(id = R.drawable.placeholder),
      contentDescription = ${contentDescription},
      modifier = Modifier.fillMaxWidth(),
      contentScale = ContentScale.${node.fit === 'contain' ? 'Fit' : 'Crop'}
    )`;
  }

  private renderSpacer(node: SpacerNode): string {
    if (node.fixedSize) {
      const size = extractSpacingValue(String(node.fixedSize));
      return `Spacer(modifier = Modifier.height(${size}.dp))`;
    }
    return 'Spacer(modifier = Modifier.weight(1f))';
  }

  private mapArrangement(align: string): string | undefined {
    switch (align) {
      case 'start': return 'Start';
      case 'center': return 'Center';
      case 'end': return 'End';
      case 'space-between': return 'SpaceBetween';
      case 'space-around': return 'SpaceAround';
      case 'space-evenly': return 'SpaceEvenly';
      default: return undefined;
    }
  }

  private mapTextAlignment(align: string): string {
    switch (align) {
      case 'center': return 'Center';
      case 'right': return 'End';
      case 'justify': return 'Justify';
      default: return 'Start';
    }
  }

  private mapFontWeight(weight: string): string {
    if (weight.includes('bold') || weight === '700') return 'Bold';
    if (weight.includes('medium') || weight === '500') return 'Medium';
    return 'Normal';
  }
}
