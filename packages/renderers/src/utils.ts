/**
 * Shared utilities for all platform renderers.
 *
 * Extracted to avoid duplication across web, iOS, Android, and desktop renderers.
 */

import type { LayoutNode, TokenRef } from '@mkatogui/ule-core';

/** Convert a string to PascalCase */
export function pascalCase(str: string): string {
  return str
    .replace(/[\s\-_]+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/** Convert a string to camelCase */
export function camelCase(str: string): string {
  return str
    .replace(/[\s\-_]+/g, ' ')
    .split(' ')
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
}

/**
 * Extract spacing value from a UDS token (e.g., "$space-4" → 16).
 * Based on the 4px grid system.
 */
export function extractSpacingValue(token: string): number {
  const match = token.match(/\$space-(\d+)/);
  if (match) {
    return parseInt(match[1], 10) * 4;
  }
  return 0;
}

/** Get direct children from any IR LayoutNode */
export function getNodeChildren(node: LayoutNode): LayoutNode[] {
  if ('children' in node && Array.isArray(node.children)) {
    return node.children;
  }
  return [];
}
