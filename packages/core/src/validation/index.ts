/**
 * IR Validation
 *
 * Validates IR documents for structural correctness,
 * token reference integrity, and accessibility compliance.
 */

import type {
  BaseNode,
  ComponentNode,
  ContainerNode,
  FrameNode,
  GridNode,
  IRDocument,
  LayoutNode,
  StackNode,
  TextNode,
  TokenRef,
} from '../types/index.js';

// ─── Validation Result ──────────────────────────────────────

export type Severity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  severity: Severity;
  nodeId: string;
  nodePath: string;
  rule: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  stats: {
    totalNodes: number;
    tokenRefs: number;
    components: number;
    unresolvedTokens: string[];
  };
}

// ─── Token Registry (known UDS tokens) ─────────────────────

const KNOWN_SPACING_TOKENS = new Set([
  '$space-1', '$space-2', '$space-3', '$space-4', '$space-5', '$space-6',
  '$space-8', '$space-10', '$space-12', '$space-16', '$space-20', '$space-24',
]);

const KNOWN_COLOR_TOKENS = new Set([
  '$color-brand', '$color-brand-hover', '$color-brand-active',
  '$color-bg-primary', '$color-bg-secondary', '$color-bg-surface',
  '$color-text-primary', '$color-text-secondary', '$color-text-muted',
  '$color-border', '$color-border-strong',
  '$color-success', '$color-warning', '$color-error', '$color-info',
]);

const KNOWN_LAYOUT_TOKENS = new Set([
  '$container-max', '$container-narrow', '$container-padding', '$section-gap',
]);

const KNOWN_MOTION_TOKENS = new Set([
  '$duration-fast', '$duration-normal', '$duration-slow', '$duration-slower',
  '$easing-standard', '$easing-decelerate', '$easing-accelerate',
]);

const KNOWN_Z_TOKENS = new Set([
  '$z-dropdown', '$z-sticky', '$z-overlay', '$z-modal', '$z-toast', '$z-tooltip', '$z-system',
]);

const ALL_KNOWN_TOKENS = new Set([
  ...KNOWN_SPACING_TOKENS,
  ...KNOWN_COLOR_TOKENS,
  ...KNOWN_LAYOUT_TOKENS,
  ...KNOWN_MOTION_TOKENS,
  ...KNOWN_Z_TOKENS,
]);

// ─── Helpers ────────────────────────────────────────────────

function isTokenRef(value: unknown): value is TokenRef {
  return typeof value === 'string' && value.startsWith('$');
}

function getChildren(node: LayoutNode): LayoutNode[] {
  if ('children' in node && Array.isArray(node.children)) {
    return node.children;
  }
  return [];
}

// ─── Validation Rules ───────────────────────────────────────

function validateNodeStructure(node: LayoutNode, path: string, issues: ValidationIssue[]): void {
  // Every node must have an id
  if (!node.id) {
    issues.push({
      severity: 'error',
      nodeId: node.id || 'unknown',
      nodePath: path,
      rule: 'node-id-required',
      message: 'Every node must have a unique id',
    });
  }

  // Every node must have a type
  if (!node.type) {
    issues.push({
      severity: 'error',
      nodeId: node.id,
      nodePath: path,
      rule: 'node-type-required',
      message: 'Every node must have a type',
    });
  }

  // StackNode must have a direction
  if (node.type === 'StackNode' && !(node as StackNode).direction) {
    issues.push({
      severity: 'error',
      nodeId: node.id,
      nodePath: path,
      rule: 'stack-direction-required',
      message: 'StackNode must specify a direction (row | column)',
    });
  }

  // TextNode must have content
  if (node.type === 'TextNode' && !(node as TextNode).content) {
    issues.push({
      severity: 'warning',
      nodeId: node.id,
      nodePath: path,
      rule: 'text-content-required',
      message: 'TextNode should have content',
    });
  }

  // ComponentNode must have a component name
  if (node.type === 'ComponentNode' && !(node as ComponentNode).component) {
    issues.push({
      severity: 'error',
      nodeId: node.id,
      nodePath: path,
      rule: 'component-name-required',
      message: 'ComponentNode must specify a component name',
    });
  }

  // GridNode should have columns defined
  if (node.type === 'GridNode' && !(node as GridNode).columns) {
    issues.push({
      severity: 'warning',
      nodeId: node.id,
      nodePath: path,
      rule: 'grid-columns-recommended',
      message: 'GridNode should define columns for predictable layout',
    });
  }
}

function collectTokenRefs(obj: unknown, refs: Set<string>): void {
  if (typeof obj === 'string' && obj.startsWith('$')) {
    refs.add(obj);
  } else if (Array.isArray(obj)) {
    for (const item of obj) collectTokenRefs(item, refs);
  } else if (obj !== null && typeof obj === 'object') {
    for (const value of Object.values(obj)) collectTokenRefs(value, refs);
  }
}

function validateAccessibility(node: LayoutNode, path: string, issues: ValidationIssue[]): void {
  // Images must have alt text
  if (node.type === 'ImageNode' && !('alt' in node && node.alt)) {
    issues.push({
      severity: 'error',
      nodeId: node.id,
      nodePath: path,
      rule: 'a11y-image-alt',
      message: 'ImageNode must have alt text for accessibility (WCAG 1.1.1)',
    });
  }

  // Interactive components should have a11y labels
  if (node.type === 'ComponentNode') {
    const comp = node as ComponentNode;
    const interactive = ['uds-btn', 'uds-input', 'uds-select', 'uds-toggle', 'uds-checkbox', 'uds-radio'];
    if (interactive.some((c) => comp.component.startsWith(c)) && !comp.a11y?.label) {
      issues.push({
        severity: 'warning',
        nodeId: node.id,
        nodePath: path,
        rule: 'a11y-interactive-label',
        message: `Interactive component "${comp.component}" should have an a11y label`,
      });
    }
  }
}

// ─── Main Validator ─────────────────────────────────────────

function walkTree(
  node: LayoutNode,
  path: string,
  issues: ValidationIssue[],
  stats: ValidationResult['stats'],
): void {
  stats.totalNodes++;

  // Collect token refs
  const refs = new Set<string>();
  collectTokenRefs(node, refs);
  stats.tokenRefs += refs.size;
  for (const ref of refs) {
    if (!ALL_KNOWN_TOKENS.has(ref)) {
      stats.unresolvedTokens.push(ref);
    }
  }

  // Count components
  if (node.type === 'ComponentNode') {
    stats.components++;
  }

  // Run validations
  validateNodeStructure(node, path, issues);
  validateAccessibility(node, path, issues);

  // Recurse into children
  const children = getChildren(node);
  for (let i = 0; i < children.length; i++) {
    walkTree(children[i], `${path}.children[${i}]`, issues, stats);
  }

  // ConditionalNode: validate branches
  if (node.type === 'ConditionalNode' && 'conditions' in node) {
    for (let i = 0; i < node.conditions.length; i++) {
      const branch = node.conditions[i];
      for (let j = 0; j < branch.children.length; j++) {
        walkTree(branch.children[j], `${path}.conditions[${i}].children[${j}]`, issues, stats);
      }
    }
    if (node.fallback) {
      for (let j = 0; j < node.fallback.length; j++) {
        walkTree(node.fallback[j], `${path}.fallback[${j}]`, issues, stats);
      }
    }
  }

  // ComponentNode: validate slots
  if (node.type === 'ComponentNode' && 'slots' in node && node.slots) {
    for (const [slotName, slotChildren] of Object.entries(node.slots)) {
      for (let j = 0; j < slotChildren.length; j++) {
        walkTree(slotChildren[j], `${path}.slots.${slotName}[${j}]`, issues, stats);
      }
    }
  }
}

/** Validate an IR document */
export function validateIR(doc: IRDocument): ValidationResult {
  const issues: ValidationIssue[] = [];
  const stats: ValidationResult['stats'] = {
    totalNodes: 0,
    tokenRefs: 0,
    components: 0,
    unresolvedTokens: [],
  };

  // Validate document metadata
  if (doc.version !== '1.0.0') {
    issues.push({
      severity: 'error',
      nodeId: 'root',
      nodePath: 'root',
      rule: 'schema-version',
      message: `Unsupported schema version: ${doc.version}. Expected "1.0.0"`,
    });
  }

  if (!doc.frames || doc.frames.length === 0) {
    issues.push({
      severity: 'error',
      nodeId: 'root',
      nodePath: 'root',
      rule: 'frames-required',
      message: 'IR document must contain at least one frame',
    });
  }

  // Walk each frame
  for (let i = 0; i < doc.frames.length; i++) {
    walkTree(doc.frames[i], `frames[${i}]`, issues, stats);
  }

  // Deduplicate unresolved tokens
  stats.unresolvedTokens = [...new Set(stats.unresolvedTokens)];

  // Warn about unresolved tokens (could be custom or palette-specific)
  if (stats.unresolvedTokens.length > 0) {
    issues.push({
      severity: 'warning',
      nodeId: 'root',
      nodePath: 'root',
      rule: 'unresolved-tokens',
      message: `${stats.unresolvedTokens.length} token refs not in standard UDS set: ${stats.unresolvedTokens.slice(0, 5).join(', ')}${stats.unresolvedTokens.length > 5 ? '...' : ''}`,
    });
  }

  return {
    valid: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
    stats,
  };
}

/** Quick check: is this a structurally valid IR document? */
export function isValidIR(doc: unknown): doc is IRDocument {
  if (!doc || typeof doc !== 'object') return false;
  const d = doc as Record<string, unknown>;
  return d.version === '1.0.0' && Array.isArray(d.frames) && d.frames.length > 0;
}
