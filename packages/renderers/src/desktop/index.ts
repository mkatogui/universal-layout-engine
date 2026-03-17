import { WebRenderer } from '../web/index.js';
import type { LayoutNode } from '@mkatogui/ule-core';

/**
 * Desktop Renderer for Universal Layout Engine
 *
 * Extends WebRenderer with desktop-specific adaptations and optimizations.
 * Generates optimized React code for desktop applications with appropriate
 * container dimensions and window chrome considerations.
 *
 * @example
 * ```ts
 * const renderer = new DesktopRenderer();
 * const files = renderer.renderDocument(irDocument);
 * ```
 */
export class DesktopRenderer extends WebRenderer {
  /**
   * Render a complete IR document into desktop React files
   *
   * Overrides parent renderDocument to add desktop-specific wrapper
   * and window constraints.
   *
   * @param doc IR document to render
   * @returns Map of filename → file content
   */
  override renderDocument(doc: any): Map<string, string> {
    const files = super.renderDocument(doc);

    // Get the main component and wrap it with desktop-specific layout
    const mainContent = files.get('main.tsx') || '';
    const enhancedContent = this.enhanceForDesktop(mainContent);

    files.set('main.tsx', enhancedContent);

    return files;
  }

  /**
   * Render a single IR node into JSX with desktop considerations
   *
   * Overrides parent to apply desktop-specific styling and sizing.
   *
   * @param node Layout node to render
   * @returns JSX string optimized for desktop
   */
  override renderNode(node: LayoutNode): string {
    const baseCode = super.renderNode(node);

    // Apply desktop-specific adjustments to the rendered code
    if (node.type === 'container' || node.type === 'stack') {
      return this.applyDesktopConstraints(baseCode, node);
    }

    return baseCode;
  }

  /**
   * Enhance component for desktop with window chrome and sizing
   * @private
   */
  private enhanceForDesktop(content: string): string {
    return `'use client';

import React from 'react';
import { useMediaQuery } from '@mkatogui/uds-react';

/**
 * Desktop Application Layout
 *
 * Optimized for desktop environments with:
 * - Window chrome and frame management
 * - Responsive breakpoints for desktop screens
 * - Tighter container padding for desktop UI
 */
export default function GeneratedComponent() {
  const isCompact = useMediaQuery('(max-width: 1024px)');
  const isWidescreen = useMediaQuery('(min-width: 1920px)');

  return (
    <div
      className="ule__desktop-window"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--color-background-primary)',
        fontSize: isWidescreen ? '16px' : '14px',
      }}
    >
      {/* Window chrome */}
      <div
        className="ule__window-chrome"
        style={{
          height: '32px',
          padding: '8px 12px',
          backgroundColor: 'var(--color-background-secondary)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          userSelect: 'none',
        }}
      >
        <div className="ule__window-controls" style={{ display: 'flex', gap: '4px' }}>
          {/* Minimize, maximize, close buttons would go here */}
        </div>
        <span
          style={{
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            marginLeft: 'auto',
          }}
        >
          Application Window
        </span>
      </div>

      {/* Main content area with constrained container */}
      <div
        className="ule__content-container"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: isCompact ? '12px' : '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div
          className="ule__content-inner"
          style={{
            width: '100%',
            maxWidth: isWidescreen ? '1400px' : isCompact ? '100%' : '1200px',
            margin: '0 auto',
          }}
        >
          ${this.extractInnerContent(content)}
        </div>
      </div>

      {/* Status bar */}
      <div
        className="ule__status-bar"
        style={{
          height: '24px',
          padding: '0 12px',
          backgroundColor: 'var(--color-background-secondary)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
        }}
      >
        Ready
      </div>
    </div>
  );
}`;
  }

  /**
   * Apply desktop-specific constraints to a node's rendered code
   * @private
   */
  private applyDesktopConstraints(code: string, node: LayoutNode): string {
    // Inject desktop-specific styling attributes into container divs
    if (code.includes('style={')) {
      // Add constraint for maximum content width on desktop
      return code.replace(
        'style={',
        'style={{ maxWidth: "1200px", margin: "0 auto", ...',
      );
    }

    return code;
  }

  /**
   * Extract the actual component content from the wrapped function
   * @private
   */
  private extractInnerContent(content: string): string {
    // Extract the return JSX from the default export
    const match = content.match(/return \(([\s\S]*?)\);/);
    return match ? match[1] : content;
  }
}
