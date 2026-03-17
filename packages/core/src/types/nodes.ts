/**
 * Universal Layout IR — Node Types
 *
 * The IR is a typed tree of layout nodes that captures design intent
 * without committing to any platform's implementation details.
 * All values reference UDS tokens ($-prefixed) resolved at render time.
 */

import type { ColorToken, MotionToken, SpacingToken, TokenOrValue, TokenRef } from './tokens.js';

// ─── Base Types ──────────────────────────────────────────────

/** All possible node types in the IR */
export type NodeType =
  | 'FrameNode'
  | 'StackNode'
  | 'GridNode'
  | 'ScrollNode'
  | 'ComponentNode'
  | 'TextNode'
  | 'ImageNode'
  | 'SpacerNode'
  | 'ConditionalNode'
  | 'SlotNode';

/** Main axis alignment (Flexbox-like) */
export type MainAxisAlign = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';

/** Cross axis alignment */
export type CrossAxisAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/** Direction for stacks */
export type Direction = 'row' | 'column' | 'row-reverse' | 'column-reverse';

/** Overflow behavior */
export type Overflow = 'visible' | 'hidden' | 'scroll' | 'auto';

/** Size constraint mode (maps to Figma: Fixed / Hug / Fill) */
export type SizeMode = 'fixed' | 'intrinsic' | 'stretch' | 'fill';

/** Breakpoint keys */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

/** Platform target for conditional rendering */
export type PlatformTarget = 'web' | 'ios' | 'android' | 'desktop' | 'tablet';

// ─── Shared Properties ──────────────────────────────────────

/** Padding expressed as token references */
export interface Padding {
  top?: TokenOrValue;
  right?: TokenOrValue;
  bottom?: TokenOrValue;
  left?: TokenOrValue;
  x?: TokenOrValue; // shorthand for left + right
  y?: TokenOrValue; // shorthand for top + bottom
}

/** Size constraints for a node */
export interface SizeConstraint {
  type: SizeMode;
  value?: TokenOrValue;    // fixed value (e.g., 200, "$space-12")
  min?: TokenOrValue;      // min-width/min-height
  max?: TokenOrValue;      // max-width/max-height (e.g., "$container-max")
}

/** Size definition (width + height) */
export interface Size {
  width?: SizeConstraint;
  height?: SizeConstraint;
  aspectRatio?: number;
}

/** Border definition */
export interface Border {
  width?: TokenOrValue;
  color?: ColorToken | TokenOrValue;
  radius?: TokenOrValue;
  style?: 'solid' | 'dashed' | 'dotted' | 'none';
}

/** Shadow definition */
export interface Shadow {
  x: TokenOrValue;
  y: TokenOrValue;
  blur: TokenOrValue;
  spread?: TokenOrValue;
  color: ColorToken | TokenOrValue;
}

/** Background definition */
export interface Background {
  color?: ColorToken | TokenOrValue;
  gradient?: {
    type: 'linear' | 'radial';
    angle?: number;
    stops: Array<{ color: ColorToken | TokenOrValue; position: number }>;
  };
  image?: {
    url: string;
    fit: 'cover' | 'contain' | 'fill' | 'none';
  };
}

/** Responsive overrides per breakpoint */
export type ResponsiveOverrides = Partial<Record<Breakpoint, Partial<Omit<BaseNode, 'id' | 'type' | 'children' | 'responsive'>>>>;

/** Accessibility properties */
export interface A11y {
  role?: string;
  label?: string;
  hint?: string;
  hidden?: boolean;
}

/** Animation / transition definition */
export interface Animation {
  property: string;
  duration: MotionToken | TokenOrValue;
  easing: MotionToken | TokenOrValue;
  delay?: MotionToken | TokenOrValue;
}

// ─── Base Node ──────────────────────────────────────────────

/** Base properties shared by all IR nodes */
export interface BaseNode {
  /** Unique identifier within the IR tree */
  id: string;

  /** Node type discriminator */
  type: NodeType;

  /** Optional human-readable name (from Figma layer name) */
  name?: string;

  /** Figma node ID for traceability */
  figmaNodeId?: string;

  /** Size constraints */
  size?: Size;

  /** Padding (inner spacing) */
  padding?: Padding;

  /** Margin (outer spacing, typically only for root-level positioning) */
  margin?: Padding;

  /** Background */
  background?: Background;

  /** Border */
  border?: Border;

  /** Shadows */
  shadows?: Shadow[];

  /** Opacity (0-1, or token like "$opacity-muted") */
  opacity?: TokenOrValue;

  /** Z-index */
  zIndex?: TokenOrValue;

  /** Overflow behavior */
  overflow?: Overflow;

  /** Responsive overrides per breakpoint */
  responsive?: ResponsiveOverrides;

  /** Accessibility properties */
  a11y?: A11y;

  /** Animations / transitions */
  animations?: Animation[];

  /** Arbitrary metadata (Figma properties, comments, etc.) */
  metadata?: Record<string, unknown>;
}

// ─── Specific Node Types ────────────────────────────────────

/** Root container for a screen or page */
export interface FrameNode extends BaseNode {
  type: 'FrameNode';
  children: LayoutNode[];
  /** Target viewport for this frame */
  viewport?: {
    width?: number;
    height?: number;
    breakpoint?: Breakpoint;
  };
}

/** 1D flex container (row or column) — maps to Figma Auto Layout */
export interface StackNode extends BaseNode {
  type: 'StackNode';
  children: LayoutNode[];
  direction: Direction;
  gap?: SpacingToken | TokenOrValue;
  mainAxisAlign?: MainAxisAlign;
  crossAxisAlign?: CrossAxisAlign;
  wrap?: boolean;
}

/** 2D grid container — maps to Figma Grid Layout */
export interface GridNode extends BaseNode {
  type: 'GridNode';
  children: LayoutNode[];
  columns?: TokenOrValue | 'auto-fit' | 'auto-fill';
  rows?: TokenOrValue;
  columnGap?: SpacingToken | TokenOrValue;
  rowGap?: SpacingToken | TokenOrValue;
  minColumnWidth?: TokenOrValue;
  maxColumnWidth?: TokenOrValue;
}

/** Scrollable container */
export interface ScrollNode extends BaseNode {
  type: 'ScrollNode';
  children: LayoutNode[];
  direction: 'vertical' | 'horizontal' | 'both';
  showIndicators?: boolean;
}

/** Reference to a UDS component */
export interface ComponentNode extends BaseNode {
  type: 'ComponentNode';
  /** UDS component name (e.g., "uds-btn", "uds-card") */
  component: string;
  /** Component variant (e.g., "primary", "raised") */
  variant?: string;
  /** Props to pass to the component */
  props?: Record<string, unknown>;
  /** Slot children (named slots) */
  slots?: Record<string, LayoutNode[]>;
  /** Direct children (default slot) */
  children?: LayoutNode[];
}

/** Text content */
export interface TextNode extends BaseNode {
  type: 'TextNode';
  content: string;
  /** Semantic tag (h1-h6, p, span, label) */
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label';
  /** Font size token */
  fontSize?: TokenOrValue;
  /** Font weight token */
  fontWeight?: TokenOrValue;
  /** Line height token */
  lineHeight?: TokenOrValue;
  /** Text color token */
  color?: ColorToken | TokenOrValue;
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  /** Max lines (truncation) */
  maxLines?: number;
}

/** Image or media content */
export interface ImageNode extends BaseNode {
  type: 'ImageNode';
  src: string;
  alt: string;
  fit?: 'cover' | 'contain' | 'fill' | 'none';
  /** Lazy loading */
  loading?: 'eager' | 'lazy';
}

/** Flexible spacer */
export interface SpacerNode extends BaseNode {
  type: 'SpacerNode';
  /** Flex grow factor (default 1) */
  grow?: number;
  /** Fixed size override */
  fixedSize?: TokenOrValue;
}

/** Conditional rendering based on platform or breakpoint */
export interface ConditionalNode extends BaseNode {
  type: 'ConditionalNode';
  /** Conditions mapped to their child trees */
  conditions: ConditionalBranch[];
  /** Fallback children if no condition matches */
  fallback?: LayoutNode[];
}

export interface ConditionalBranch {
  /** Match by platform */
  platform?: PlatformTarget;
  /** Match by breakpoint */
  breakpoint?: Breakpoint;
  /** Match by min-width */
  minWidth?: number;
  /** Match by max-width */
  maxWidth?: number;
  /** Match by orientation */
  orientation?: 'portrait' | 'landscape';
  /** Children rendered when condition matches */
  children: LayoutNode[];
}

/** Named content placeholder (slot) */
export interface SlotNode extends BaseNode {
  type: 'SlotNode';
  /** Slot name for content injection */
  slotName: string;
  /** Default children if no content injected */
  defaultChildren?: LayoutNode[];
}

// ─── Union Type ─────────────────────────────────────────────

/** Any layout node in the IR tree */
export type LayoutNode =
  | FrameNode
  | StackNode
  | GridNode
  | ScrollNode
  | ComponentNode
  | TextNode
  | ImageNode
  | SpacerNode
  | ConditionalNode
  | SlotNode;

/** Nodes that can contain children */
export type ContainerNode = FrameNode | StackNode | GridNode | ScrollNode;

// ─── IR Document ────────────────────────────────────────────

/** Complete IR document representing one or more screens */
export interface IRDocument {
  /** Schema version */
  version: '1.0.0';
  /** Document metadata */
  meta: {
    name: string;
    description?: string;
    figmaFileId?: string;
    figmaPageName?: string;
    generatedAt: string;
    generatedBy: string;
    palette?: string;
  };
  /** Root frames (screens/pages) */
  frames: FrameNode[];
}
