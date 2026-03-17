import type { IRDocument } from '@mkatogui/ule-core';
import { WebRenderer } from '../web/index.js';

/**
 * Desktop Renderer for Universal Layout Engine
 *
 * Extends WebRenderer with desktop-specific window chrome and sizing.
 * Uses `@mkatogui/ule-core` IR types exclusively.
 */
export class DesktopRenderer extends WebRenderer {
  /**
   * Render a complete IR document into desktop React files.
   * Wraps the web output with window chrome and desktop constraints.
   */
  override renderDocument(doc: IRDocument): Map<string, string> {
    const files = super.renderDocument(doc);

    // Get the web main file and enhance it for desktop
    const mainContent = files.get('main.tsx') ?? '';
    files.set('main.tsx', this.wrapForDesktop(mainContent));

    return files;
  }

  /**
   * Wrap web component output with desktop window chrome
   */
  private wrapForDesktop(webContent: string): string {
    return `'use client';

import React from 'react';

/**
 * Desktop Application Layout
 *
 * Wraps the generated layout with window chrome, responsive
 * container constraints, and a status bar.
 */
export default function DesktopLayout() {
  return (
    <div
      className="ule__desktop-window"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--color-bg-primary)',
      }}
    >
      {/* Window chrome */}
      <div
        className="ule__window-chrome"
        style={{
          height: '32px',
          padding: '8px 12px',
          backgroundColor: 'var(--color-bg-secondary)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          userSelect: 'none',
        }}
      >
        <div className="ule__window-controls" style={{ display: 'flex', gap: '4px' }} />
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
          Application Window
        </span>
      </div>

      {/* Main content */}
      <div
        className="ule__content-container"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div
          className="ule__content-inner"
          style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}
        >
          {/* Generated content is rendered here */}
          <GeneratedContent />
        </div>
      </div>

      {/* Status bar */}
      <div
        className="ule__status-bar"
        style={{
          height: '24px',
          padding: '0 12px',
          backgroundColor: 'var(--color-bg-secondary)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          fontSize: '11px',
          color: 'var(--color-text-muted)',
        }}
      >
        Ready
      </div>
    </div>
  );
}

/* Original generated content is placed below for reference */
${webContent}
`;
  }
}
