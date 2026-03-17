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
  ConditionalNode,
  SlotNode,
  LayoutNode,
  Padding,
} from '@mkatogui/ule-core';

import { pascalCase, camelCase, getNodeChildren } from '../utils.js';

/**
 * Web Renderer for Universal Layout Engine
 *
 * Converts IR layout nodes into React + UDS (Universal Design System) code.
 * Uses `@mkatogui/ule-core` IR types exclusively.
 */
export class WebRenderer {
  private imports: Set<string> = new Set();

  /**
   * Render a complete IR document into React files
   */
  renderDocument(doc: IRDocument): Map<string, string> {
    this.imports.clear();

    const files = new Map<string, string>();

    const frameJsx = doc.frames
      .map((frame) => this.renderNode(frame))
      .join('\n\n');

    const mainFile = this.wrapWithImports(frameJsx);
    files.set('main.tsx', mainFile);

    return files;
  }

  /**
   * Render a single IR node into JSX
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
      case 'ConditionalNode':
        return this.renderConditional(node);
      case 'SlotNode':
        return this.renderSlot(node);
      default:
        return `{/* Unknown node type: ${(node as LayoutNode).type} */}`;
    }
  }

  private renderFrame(node: FrameNode): string {
    const children = node.children.map((child) => this.renderNode(child)).join('\n  ');
    const style = this.buildPaddingStyle(node.padding);
    const styleAttr = Object.keys(style).length > 0 ? ` style={${JSON.stringify(style)}}` : '';

    return `<div className="ule__frame" data-testid="${node.id}"${styleAttr}>
  ${children}
</div>`;
  }

  private renderStack(node: StackNode): string {
    const style: Record<string, string> = {
      display: 'flex',
      flexDirection: node.direction === 'row' ? 'row' : 'column',
    };
    if (node.gap) style.gap = this.tokenToVar(String(node.gap));
    if (node.crossAxisAlign) style.alignItems = this.mapFlexAlign(node.crossAxisAlign);
    if (node.mainAxisAlign) style.justifyContent = this.mapFlexJustify(node.mainAxisAlign);
    Object.assign(style, this.buildPaddingStyle(node.padding));

    const children = node.children.map((child) => this.renderNode(child)).join('\n  ');

    return `<div className="ule__stack" style={${JSON.stringify(style)}} data-testid="${node.id}">
  ${children}
</div>`;
  }

  private renderGrid(node: GridNode): string {
    const columns = typeof node.columns === 'number'
      ? `repeat(${node.columns}, 1fr)`
      : String(node.columns ?? 'auto');
    const style: Record<string, string> = {
      display: 'grid',
      gridTemplateColumns: columns,
    };
    if (node.columnGap) style.columnGap = this.tokenToVar(String(node.columnGap));
    if (node.rowGap) style.rowGap = this.tokenToVar(String(node.rowGap));

    const children = node.children.map((child) => this.renderNode(child)).join('\n  ');

    return `<div className="ule__grid" style={${JSON.stringify(style)}} data-testid="${node.id}">
  ${children}
</div>`;
  }

  private renderScroll(node: ScrollNode): string {
    const overflow = node.direction === 'both'
      ? 'auto'
      : node.direction === 'horizontal' ? 'auto hidden' : 'hidden auto';
    const children = node.children.map((child) => this.renderNode(child)).join('\n  ');

    return `<div className="ule__scroll" style={${JSON.stringify({ overflow })}} data-testid="${node.id}">
  ${children}
</div>`;
  }

  private renderComponent(node: ComponentNode): string {
    const componentName = pascalCase(node.component);
    this.imports.add(`import { ${componentName} } from '@mkatogui/uds-react';`);

    const props = { ...(node.props ?? {}) };
    if (node.variant) props.variant = node.variant;

    const propString = Object.entries(props)
      .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
      .join(' ');

    const children = getNodeChildren(node);
    if (children.length > 0) {
      const childrenJsx = children.map((child) => this.renderNode(child)).join('\n  ');
      return `<${componentName} ${propString} data-testid="${node.id}">
  ${childrenJsx}
</${componentName}>`;
    }

    return `<${componentName} ${propString} data-testid="${node.id}" />`;
  }

  private renderText(node: TextNode): string {
    const tag = node.tag ?? 'span';
    const style: Record<string, string> = {};
    if (node.fontSize) style.fontSize = this.tokenToVar(String(node.fontSize));
    if (node.fontWeight) style.fontWeight = this.tokenToVar(String(node.fontWeight));
    if (node.textAlign) style.textAlign = node.textAlign;
    if (node.color) style.color = this.tokenToVar(String(node.color));

    const styleAttr = Object.keys(style).length > 0 ? ` style={${JSON.stringify(style)}}` : '';

    return `<${tag} className="ule__text"${styleAttr} data-testid="${node.id}">
  ${node.content}
</${tag}>`;
  }

  private renderImage(node: ImageNode): string {
    const style: Record<string, string> = {};
    if (node.fit) style.objectFit = node.fit;

    const styleAttr = Object.keys(style).length > 0 ? ` style={${JSON.stringify(style)}}` : '';

    return `<img
  src="${node.src}"
  alt="${node.alt}"
  className="ule__image"${styleAttr}
  loading="${node.loading ?? 'lazy'}"
  data-testid="${node.id}"
/>`;
  }

  private renderSpacer(node: SpacerNode): string {
    const style: Record<string, string | number> = { flex: node.grow ?? 1 };
    if (node.fixedSize) {
      const v = this.tokenToVar(String(node.fixedSize));
      style.width = v;
      style.height = v;
    }

    return `<div className="ule__spacer" style={${JSON.stringify(style)}} data-testid="${node.id}" />`;
  }

  private renderConditional(node: ConditionalNode): string {
    const branches = node.conditions.map((branch, i) => {
      const condition = branch.platform
        ? `platform === '${branch.platform}'`
        : branch.breakpoint
        ? `breakpoint === '${branch.breakpoint}'`
        : branch.minWidth
        ? `width >= ${branch.minWidth}`
        : 'true';
      const children = branch.children.map((child) => this.renderNode(child)).join('\n  ');
      return `{/* Branch ${i}: ${condition} */}\n  ${children}`;
    }).join('\n');

    return `{/* ConditionalNode: ${node.id} */}\n${branches}`;
  }

  private renderSlot(node: SlotNode): string {
    const defaults = node.defaultChildren
      ? node.defaultChildren.map((child) => this.renderNode(child)).join('\n  ')
      : '{/* Empty slot */}';

    return `{/* Slot: ${node.slotName} */}
{props.${camelCase(node.slotName)} ?? (
  ${defaults}
)}`;
  }

  // ─── Style Helpers ──────────────────────────────────────

  /** Convert a $token ref to CSS var(--token) */
  private tokenToVar(token: string): string {
    if (token.startsWith('$')) {
      return `var(--${token.slice(1)})`;
    }
    return token;
  }

  private buildPaddingStyle(padding?: Padding): Record<string, string> {
    if (!padding) return {};
    const result: Record<string, string> = {};
    const resolved: Record<string, string> = {};
    for (const [side, value] of Object.entries(padding) as [string, string | number | undefined][]) {
      if (value && typeof value === 'string') {
        const v = this.tokenToVar(value);
        if (side === 'y') {
          resolved.top = v;
          resolved.bottom = v;
        } else if (side === 'x') {
          resolved.left = v;
          resolved.right = v;
        } else {
          resolved[side] = v;
        }
      }
    }
    for (const [side, value] of Object.entries(resolved)) {
      result[`padding${side.charAt(0).toUpperCase()}${side.slice(1)}`] = value;
    }
    return result;
  }

  private mapFlexAlign(align: string): string {
    switch (align) {
      case 'start': return 'flex-start';
      case 'end': return 'flex-end';
      case 'center': return 'center';
      case 'stretch': return 'stretch';
      case 'baseline': return 'baseline';
      default: return align;
    }
  }

  private mapFlexJustify(justify: string): string {
    switch (justify) {
      case 'start': return 'flex-start';
      case 'end': return 'flex-end';
      case 'center': return 'center';
      case 'space-between': return 'space-between';
      case 'space-around': return 'space-around';
      case 'space-evenly': return 'space-evenly';
      default: return justify;
    }
  }

  protected wrapWithImports(content: string): string {
    const importLines = Array.from(this.imports).join('\n');

    return `'use client';

${importLines}

export default function GeneratedLayout() {
  return (
    ${content}
  );
}`;
  }
}
