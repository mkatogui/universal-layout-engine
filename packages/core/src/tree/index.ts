/**
 * IR Tree Utilities
 *
 * Functions for traversing, querying, transforming,
 * and optimizing the Universal Layout IR tree.
 */

import type {
  ContainerNode,
  FrameNode,
  IRDocument,
  LayoutNode,
  NodeType,
} from '../types/index.js';

// ─── Traversal ──────────────────────────────────────────────

/** Get direct children of a node */
export function getChildren(node: LayoutNode): LayoutNode[] {
  if ('children' in node && Array.isArray(node.children)) {
    return node.children;
  }
  return [];
}

/** Check if a node is a container (has children) */
export function isContainer(node: LayoutNode): node is ContainerNode {
  return ['FrameNode', 'StackNode', 'GridNode', 'ScrollNode'].includes(node.type);
}

/** Depth-first walk of the IR tree */
export function walkTree(
  node: LayoutNode,
  visitor: (node: LayoutNode, depth: number, parent?: LayoutNode) => void | false,
  depth = 0,
  parent?: LayoutNode,
): void {
  const result = visitor(node, depth, parent);
  if (result === false) return; // stop descent

  for (const child of getChildren(node)) {
    walkTree(child, visitor, depth + 1, node);
  }

  // Walk ConditionalNode branches
  if (node.type === 'ConditionalNode' && 'conditions' in node) {
    for (const branch of node.conditions) {
      for (const child of branch.children) {
        walkTree(child, visitor, depth + 1, node);
      }
    }
    if (node.fallback) {
      for (const child of node.fallback) {
        walkTree(child, visitor, depth + 1, node);
      }
    }
  }

  // Walk ComponentNode slots
  if (node.type === 'ComponentNode' && 'slots' in node && node.slots) {
    for (const slotChildren of Object.values(node.slots)) {
      for (const child of slotChildren) {
        walkTree(child, visitor, depth + 1, node);
      }
    }
  }
}

/** Walk all nodes in an IR document */
export function walkDocument(
  doc: IRDocument,
  visitor: (node: LayoutNode, depth: number, parent?: LayoutNode) => void | false,
): void {
  for (const frame of doc.frames) {
    walkTree(frame, visitor);
  }
}

// ─── Queries ────────────────────────────────────────────────

/** Find a node by ID */
export function findById(doc: IRDocument, id: string): LayoutNode | undefined {
  let found: LayoutNode | undefined;
  walkDocument(doc, (node) => {
    if (node.id === id) {
      found = node;
      return false; // stop
    }
  });
  return found;
}

/** Find all nodes of a specific type */
export function findByType<T extends LayoutNode>(doc: IRDocument, type: NodeType): T[] {
  const results: T[] = [];
  walkDocument(doc, (node) => {
    if (node.type === type) {
      results.push(node as T);
    }
  });
  return results;
}

/** Find all ComponentNodes referencing a specific UDS component */
export function findByComponent(doc: IRDocument, componentName: string): LayoutNode[] {
  const results: LayoutNode[] = [];
  walkDocument(doc, (node) => {
    if (node.type === 'ComponentNode' && 'component' in node && node.component === componentName) {
      results.push(node);
    }
  });
  return results;
}

/** Count total nodes in the document */
export function countNodes(doc: IRDocument): number {
  let count = 0;
  walkDocument(doc, () => { count++; });
  return count;
}

/** Get the max depth of the tree */
export function maxDepth(doc: IRDocument): number {
  let max = 0;
  walkDocument(doc, (_node, depth) => {
    if (depth > max) max = depth;
  });
  return max;
}

// ─── Transformations ────────────────────────────────────────

/** Map over all nodes, returning a new tree */
export function mapTree(
  node: LayoutNode,
  transform: (node: LayoutNode) => LayoutNode,
): LayoutNode {
  const transformed = transform({ ...node });
  const children = getChildren(transformed);

  if (children.length > 0 && 'children' in transformed) {
    (transformed as ContainerNode).children = children.map((child) =>
      mapTree(child, transform),
    );
  }

  return transformed;
}

/** Filter nodes from the tree (removes nodes where predicate returns false) */
export function filterTree(
  node: LayoutNode,
  predicate: (node: LayoutNode) => boolean,
): LayoutNode | null {
  if (!predicate(node)) return null;

  const children = getChildren(node);
  if (children.length > 0 && 'children' in node) {
    const filtered = children
      .map((child) => filterTree(child, predicate))
      .filter((child): child is LayoutNode => child !== null);

    return { ...node, children: filtered } as LayoutNode;
  }

  return { ...node };
}

// ─── Optimizations ──────────────────────────────────────────

/**
 * Collapse unnecessary wrapper nodes.
 * A StackNode with a single child and no styling can be replaced by its child.
 */
export function collapseWrappers(node: LayoutNode): LayoutNode {
  const children = getChildren(node);

  // Recursively optimize children first
  if (children.length > 0 && 'children' in node) {
    const optimized = children.map(collapseWrappers);
    (node as ContainerNode).children = optimized;
  }

  // Collapse single-child stacks with no meaningful properties
  if (
    node.type === 'StackNode' &&
    children.length === 1 &&
    !node.padding &&
    !node.background &&
    !node.border &&
    !node.shadows?.length &&
    !node.responsive
  ) {
    return children[0];
  }

  return node;
}

/** Remove all empty containers from the tree */
export function removeEmptyContainers(node: LayoutNode): LayoutNode | null {
  const children = getChildren(node);

  if (isContainer(node)) {
    const filtered = children
      .map(removeEmptyContainers)
      .filter((child): child is LayoutNode => child !== null);

    if (filtered.length === 0 && !node.background && !node.border) {
      return null;
    }

    return { ...node, children: filtered } as LayoutNode;
  }

  return node;
}

// ─── Serialization ──────────────────────────────────────────

/** Serialize an IR document to JSON string */
export function serializeIR(doc: IRDocument): string {
  return JSON.stringify(doc, null, 2);
}

/** Parse an IR document from JSON string */
export function parseIR(json: string): IRDocument {
  return JSON.parse(json) as IRDocument;
}

/** Create a minimal IR document */
export function createDocument(
  name: string,
  frames: FrameNode[],
  meta?: Partial<IRDocument['meta']>,
): IRDocument {
  return {
    version: '1.0.0',
    meta: {
      name,
      generatedAt: new Date().toISOString(),
      generatedBy: '@mkatogui/ule-core',
      ...meta,
    },
    frames,
  };
}
