/**
 * Token Resolver
 *
 * Resolves UDS design token references ($-prefixed) into
 * platform-specific values for CSS, Swift, Compose, and JSON.
 */

import type {
  Platform,
  ResolvedToken,
  TokenDictionary,
  TokenFormat,
  TokenRef,
  UdsPalette,
} from '../types/index.js';

// ─── UDS Token Definitions ──────────────────────────────────
// Source: @mkatogui/uds-tokens (W3C DTCG format)

interface TokenDefinition {
  ref: TokenRef;
  tier: 'primitive' | 'semantic' | 'palette';
  category: 'spacing' | 'color' | 'typography' | 'layout' | 'motion' | 'z-index' | 'opacity';
  /** Raw value (CSS-oriented, used as base for platform conversion) */
  value: string | number;
}

const UDS_TOKENS: TokenDefinition[] = [
  // ── Spacing (4px grid) ──
  { ref: '$space-1', tier: 'primitive', category: 'spacing', value: 4 },
  { ref: '$space-2', tier: 'primitive', category: 'spacing', value: 8 },
  { ref: '$space-3', tier: 'primitive', category: 'spacing', value: 12 },
  { ref: '$space-4', tier: 'primitive', category: 'spacing', value: 16 },
  { ref: '$space-5', tier: 'primitive', category: 'spacing', value: 20 },
  { ref: '$space-6', tier: 'primitive', category: 'spacing', value: 24 },
  { ref: '$space-8', tier: 'primitive', category: 'spacing', value: 32 },
  { ref: '$space-10', tier: 'primitive', category: 'spacing', value: 40 },
  { ref: '$space-12', tier: 'primitive', category: 'spacing', value: 48 },
  { ref: '$space-16', tier: 'primitive', category: 'spacing', value: 64 },
  { ref: '$space-20', tier: 'primitive', category: 'spacing', value: 80 },
  { ref: '$space-24', tier: 'primitive', category: 'spacing', value: 96 },

  // ── Colors (semantic tier — base/light mode) ──
  { ref: '$color-brand', tier: 'semantic', category: 'color', value: '#1A56DB' },
  { ref: '$color-brand-hover', tier: 'semantic', category: 'color', value: '#1648C0' },
  { ref: '$color-brand-active', tier: 'semantic', category: 'color', value: '#123BA3' },
  { ref: '$color-bg-primary', tier: 'semantic', category: 'color', value: '#FFFFFF' },
  { ref: '$color-bg-secondary', tier: 'semantic', category: 'color', value: '#F9FAFB' },
  { ref: '$color-bg-surface', tier: 'semantic', category: 'color', value: '#FFFFFF' },
  { ref: '$color-text-primary', tier: 'semantic', category: 'color', value: '#111827' },
  { ref: '$color-text-secondary', tier: 'semantic', category: 'color', value: '#4B5563' },
  { ref: '$color-text-muted', tier: 'semantic', category: 'color', value: '#9CA3AF' },
  { ref: '$color-border', tier: 'semantic', category: 'color', value: '#E5E7EB' },
  { ref: '$color-border-strong', tier: 'semantic', category: 'color', value: '#D1D5DB' },
  { ref: '$color-success', tier: 'semantic', category: 'color', value: '#059669' },
  { ref: '$color-warning', tier: 'semantic', category: 'color', value: '#D97706' },
  { ref: '$color-error', tier: 'semantic', category: 'color', value: '#DC2626' },
  { ref: '$color-info', tier: 'semantic', category: 'color', value: '#2563EB' },

  // ── Typography ──
  { ref: '$font-size-xs', tier: 'primitive', category: 'typography', value: 12 },
  { ref: '$font-size-sm', tier: 'primitive', category: 'typography', value: 14 },
  { ref: '$font-size-md', tier: 'primitive', category: 'typography', value: 16 },
  { ref: '$font-size-lg', tier: 'primitive', category: 'typography', value: 18 },
  { ref: '$font-size-xl', tier: 'primitive', category: 'typography', value: 20 },
  { ref: '$font-size-2xl', tier: 'primitive', category: 'typography', value: 24 },
  { ref: '$font-size-3xl', tier: 'primitive', category: 'typography', value: 30 },
  { ref: '$font-size-4xl', tier: 'primitive', category: 'typography', value: 36 },
  { ref: '$font-weight-normal', tier: 'primitive', category: 'typography', value: 400 },
  { ref: '$font-weight-medium', tier: 'primitive', category: 'typography', value: 500 },
  { ref: '$font-weight-bold', tier: 'primitive', category: 'typography', value: 700 },
  { ref: '$line-height-tight', tier: 'primitive', category: 'typography', value: 1.25 },
  { ref: '$line-height-normal', tier: 'primitive', category: 'typography', value: 1.5 },
  { ref: '$line-height-relaxed', tier: 'primitive', category: 'typography', value: 1.75 },

  // ── Layout ──
  { ref: '$container-max', tier: 'semantic', category: 'layout', value: 1280 },
  { ref: '$container-narrow', tier: 'semantic', category: 'layout', value: 768 },
  { ref: '$container-padding', tier: 'semantic', category: 'layout', value: 'clamp(16px, 5vw, 80px)' },
  { ref: '$section-gap', tier: 'semantic', category: 'layout', value: 'clamp(48px, 8vw, 128px)' },

  // ── Motion ──
  { ref: '$duration-fast', tier: 'primitive', category: 'motion', value: 100 },
  { ref: '$duration-normal', tier: 'primitive', category: 'motion', value: 300 },
  { ref: '$duration-slow', tier: 'primitive', category: 'motion', value: 500 },
  { ref: '$duration-slower', tier: 'primitive', category: 'motion', value: 600 },
  { ref: '$easing-standard', tier: 'primitive', category: 'motion', value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  { ref: '$easing-decelerate', tier: 'primitive', category: 'motion', value: 'cubic-bezier(0, 0, 0.2, 1)' },
  { ref: '$easing-accelerate', tier: 'primitive', category: 'motion', value: 'cubic-bezier(0.4, 0, 1, 1)' },

  // ── Z-Index ──
  { ref: '$z-dropdown', tier: 'semantic', category: 'z-index', value: 100 },
  { ref: '$z-sticky', tier: 'semantic', category: 'z-index', value: 200 },
  { ref: '$z-overlay', tier: 'semantic', category: 'z-index', value: 250 },
  { ref: '$z-modal', tier: 'semantic', category: 'z-index', value: 300 },
  { ref: '$z-toast', tier: 'semantic', category: 'z-index', value: 400 },
  { ref: '$z-tooltip', tier: 'semantic', category: 'z-index', value: 500 },
  { ref: '$z-system', tier: 'semantic', category: 'z-index', value: 9999 },

  // ── Opacity ──
  { ref: '$opacity-disabled', tier: 'primitive', category: 'opacity', value: 0.4 },
  { ref: '$opacity-muted', tier: 'primitive', category: 'opacity', value: 0.6 },
  { ref: '$opacity-subtle', tier: 'primitive', category: 'opacity', value: 0.8 },
];

const TOKEN_MAP = new Map(UDS_TOKENS.map((t) => [t.ref, t]));

// ─── Platform Converters ────────────────────────────────────

function hexToSwiftColor(hex: string): string {
  const clean = hex.replace('#', '');
  return `Color(hex: 0x${clean})`;
}

function hexToComposeColor(hex: string): string {
  const clean = hex.replace('#', '');
  return `Color(0xFF${clean.toUpperCase()})`;
}

function resolveCss(def: TokenDefinition): string {
  const name = def.ref.replace('$', '--');
  switch (def.category) {
    case 'spacing':
    case 'layout':
      return typeof def.value === 'number' ? `${def.value}px` : String(def.value);
    case 'color':
      return String(def.value);
    case 'typography':
      if (def.ref.includes('font-size')) return typeof def.value === 'number' ? `${def.value}px` : String(def.value);
      if (def.ref.includes('font-weight')) return String(def.value);
      if (def.ref.includes('line-height')) return String(def.value);
      return String(def.value);
    case 'motion':
      if (def.ref.includes('duration')) return `${def.value}ms`;
      return String(def.value);
    case 'z-index':
      return String(def.value);
    case 'opacity':
      return String(def.value);
    default:
      return String(def.value);
  }
}

function resolveSwift(def: TokenDefinition): string {
  switch (def.category) {
    case 'spacing':
    case 'layout':
      return typeof def.value === 'number' ? `CGFloat(${def.value})` : `/* ${def.value} */`;
    case 'color':
      return hexToSwiftColor(String(def.value));
    case 'typography':
      if (def.ref.includes('font-size')) return `CGFloat(${def.value})`;
      if (def.ref.includes('font-weight')) {
        const w = def.value as number;
        if (w <= 400) return '.regular';
        if (w <= 500) return '.medium';
        return '.bold';
      }
      return String(def.value);
    case 'motion':
      if (def.ref.includes('duration')) return `${Number(def.value) / 1000}`;
      return `/* ${def.value} */`;
    case 'z-index':
      return `CGFloat(${def.value})`;
    case 'opacity':
      return String(def.value);
    default:
      return String(def.value);
  }
}

function resolveCompose(def: TokenDefinition): string {
  switch (def.category) {
    case 'spacing':
    case 'layout':
      return typeof def.value === 'number' ? `${def.value}.dp` : `/* ${def.value} */`;
    case 'color':
      return hexToComposeColor(String(def.value));
    case 'typography':
      if (def.ref.includes('font-size')) return `${def.value}.sp`;
      if (def.ref.includes('font-weight')) {
        const w = def.value as number;
        if (w <= 400) return 'FontWeight.Normal';
        if (w <= 500) return 'FontWeight.Medium';
        return 'FontWeight.Bold';
      }
      return String(def.value);
    case 'motion':
      if (def.ref.includes('duration')) return `${def.value}`;
      return `/* ${def.value} */`;
    case 'z-index':
      return `${def.value}f`;
    case 'opacity':
      return `${def.value}f`;
    default:
      return String(def.value);
  }
}

// ─── Public API ─────────────────────────────────────────────

/** Resolve a single token reference for a platform */
export function resolveToken(
  ref: TokenRef,
  platform: Platform,
  format?: TokenFormat,
): ResolvedToken | null {
  const def = TOKEN_MAP.get(ref);
  if (!def) return null;

  const fmt = format ?? platformToFormat(platform);
  let value: string;

  switch (platform) {
    case 'web':
    case 'desktop':
      value = resolveCss(def);
      break;
    case 'ios':
      value = resolveSwift(def);
      break;
    case 'android':
      value = resolveCompose(def);
      break;
    default:
      value = resolveCss(def);
  }

  return {
    name: ref.replace('$', ''),
    ref,
    value,
    platform,
    format: fmt,
    tier: def.tier,
  };
}

/** Resolve all UDS tokens for a platform */
export function resolveAllTokens(
  platform: Platform,
  _palette?: UdsPalette,
): TokenDictionary {
  const tokens: Record<string, ResolvedToken> = {};

  for (const def of UDS_TOKENS) {
    const resolved = resolveToken(def.ref, platform);
    if (resolved) {
      tokens[def.ref] = resolved;
    }
  }

  return {
    version: '1.0.0',
    palette: _palette ?? 'minimal-saas',
    tokens,
  };
}

/** Generate a CSS custom properties file */
export function generateCssTokens(_palette?: UdsPalette): string {
  const lines: string[] = [
    '/* Generated by @mkatogui/ule-core — DO NOT EDIT */',
    `/* Palette: ${_palette ?? 'minimal-saas'} */`,
    '',
    ':root {',
  ];

  for (const def of UDS_TOKENS) {
    const name = def.ref.replace('$', '--');
    const value = resolveCss(def);
    lines.push(`  ${name}: ${value};`);
  }

  lines.push('}', '');
  return lines.join('\n');
}

/** Generate Swift token constants */
export function generateSwiftTokens(): string {
  const lines: string[] = [
    '// Generated by @mkatogui/ule-core — DO NOT EDIT',
    'import SwiftUI',
    '',
    'enum UDSTokens {',
  ];

  const categories = new Map<string, TokenDefinition[]>();
  for (const def of UDS_TOKENS) {
    const cat = def.category;
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(def);
  }

  for (const [category, defs] of categories) {
    lines.push(`  // MARK: - ${category.charAt(0).toUpperCase() + category.slice(1)}`);
    for (const def of defs) {
      const name = def.ref.replace('$', '').replace(/-/g, '_');
      const value = resolveSwift(def);
      if (def.category === 'color') {
        lines.push(`  static let ${name} = ${value}`);
      } else {
        lines.push(`  static let ${name}: CGFloat = ${value}`);
      }
    }
    lines.push('');
  }

  lines.push('}', '');
  return lines.join('\n');
}

/** Generate Jetpack Compose token object */
export function generateComposeTokens(): string {
  const lines: string[] = [
    '// Generated by @mkatogui/ule-core — DO NOT EDIT',
    'package com.mkatogui.uds.tokens',
    '',
    'import androidx.compose.ui.graphics.Color',
    'import androidx.compose.ui.text.font.FontWeight',
    'import androidx.compose.ui.unit.dp',
    'import androidx.compose.ui.unit.sp',
    '',
    'object UDSTokens {',
  ];

  const categories = new Map<string, TokenDefinition[]>();
  for (const def of UDS_TOKENS) {
    const cat = def.category;
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(def);
  }

  for (const [category, defs] of categories) {
    lines.push(`  // ${category.charAt(0).toUpperCase() + category.slice(1)}`);
    for (const def of defs) {
      const name = def.ref.replace('$', '').replace(/-/g, '_');
      const value = resolveCompose(def);
      lines.push(`  val ${name} = ${value}`);
    }
    lines.push('');
  }

  lines.push('}', '');
  return lines.join('\n');
}

/** Check if a string is a known UDS token */
export function isKnownToken(ref: string): boolean {
  return TOKEN_MAP.has(ref as TokenRef);
}

/** Get all available token references */
export function getAllTokenRefs(): TokenRef[] {
  return UDS_TOKENS.map((t) => t.ref);
}

function platformToFormat(platform: Platform): TokenFormat {
  switch (platform) {
    case 'web':
    case 'desktop':
      return 'css';
    case 'ios':
      return 'swift';
    case 'android':
      return 'compose';
    default:
      return 'css';
  }
}
