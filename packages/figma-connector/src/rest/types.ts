/**
 * Figma REST API type definitions
 */

export interface FigmaFile {
  key: string;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  componentSets: Record<string, FigmaComponentSet>;
  styles: Record<string, FigmaStyle>;
  variables: Record<string, Record<string, FigmaVariable>>;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: FigmaNodeType;
  visible?: boolean;
  locked?: boolean;
  children?: FigmaNode[];
  componentKey?: string;
  mainComponent?: boolean;
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  strokeWeight?: number;
  strokeAlign?: 'INSIDE' | 'CENTER' | 'OUTSIDE';
  effects?: FigmaEffect[];
  opacity?: number;
  blendMode?: string;
  isMask?: boolean;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  absoluteRenderBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  size?: {
    x: number;
    y: number;
  };
  relativeTransform?: number[][];
  rotation?: number;
  constraints?: FigmaConstraint;
  layoutAlign?: string;
  layoutGrow?: number;
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  autoLayout?: FigmaAutoLayout;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  counterAxisSpacing?: number;
  itemReverseZIndex?: boolean;
  strokesIncludedInLayout?: boolean;
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  characters?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
  letterSpacing?: {
    value: number;
    unit: 'PIXELS' | 'PERCENT';
  };
  lineHeightPx?: number;
  lineHeightPercent?: number;
  paragraphIndent?: number;
  paragraphSpacing?: number;
  textDecoration?: 'UNDERLINE' | 'STRIKETHROUGH';
  textCase?: 'UPPER' | 'LOWER' | 'TITLE' | 'SMALL_CAPS' | 'SMALL_CAPS_FORCED';
  textTruncate?: 'DISABLED' | 'ENDING';
  hyperlink?: {
    type: 'URL' | 'NODE' | 'BACK' | 'FORWARD';
    url?: string;
  };
  shared?: boolean;
  export?: FigmaExportSetting[];
  guides?: FigmaGuide[];
}

export type FigmaNodeType =
  | 'DOCUMENT'
  | 'CANVAS'
  | 'FRAME'
  | 'GROUP'
  | 'COMPONENT'
  | 'COMPONENT_SET'
  | 'INSTANCE'
  | 'BOOLEAN_OPERATION'
  | 'VECTOR'
  | 'STAR'
  | 'LINE'
  | 'ELLIPSE'
  | 'POLYGON'
  | 'RECTANGLE'
  | 'TABLE'
  | 'TABLE_CELL'
  | 'TEXT'
  | 'SLICE'
  | 'STICKY'
  | 'SHAPE_WITH_TEXT'
  | 'CONNECTOR'
  | 'WASHI_TAPE';

export interface FigmaAutoLayout {
  layoutMode: 'HORIZONTAL' | 'VERTICAL';
  layoutAlign?: string;
  layoutGrow?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  counterAxisSpacing?: number;
  itemReverseZIndex?: boolean;
  strokesIncludedInLayout?: boolean;
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
}

export interface FigmaConstraint {
  type: 'FIXED' | 'HUG' | 'FILL';
  minValue?: number;
  maxValue?: number;
}

export interface FigmaComponent {
  key: string;
  fileKey: string;
  nodeId: string;
  name: string;
  description: string;
  created: string;
  updated: string;
  documentationLinks: Array<{
    uri: string;
  }>;
}

export interface FigmaComponentSet {
  key: string;
  fileKey: string;
  nodeId: string;
  name: string;
  description: string;
}

export interface FigmaVariable {
  id: string;
  name: string;
  key?: string;
  variableCollectionId: string;
  resolvedType: 'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING';
  valuesByMode: Record<string, boolean | string | number>;
  remote: boolean;
  description?: string;
  hiddenFromPublishing?: boolean;
  scopes?: ('ALL_SCOPES' | 'COMPONENT_MAIN' | 'FRAME' | 'PAGE')[];
}

export interface FigmaStyle {
  key: string;
  fileKey: string;
  nodeId: string;
  name: string;
  description: string;
  styleType: 'FILL' | 'STROKE' | 'TEXT' | 'EFFECT' | 'GRID';
}

export interface FigmaFill {
  blendMode?: string;
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'EMOJI';
  color?: FigmaColor;
  opacity?: number;
  gradientStops?: Array<{
    color: FigmaColor;
    position: number;
  }>;
  gradientHandlePositions?: Array<{
    x: number;
    y: number;
  }>;
  rotation?: number;
  imageRef?: string;
  scalingFactor?: number;
  rotation?: number;
  filters?: {
    exposure?: number;
    contrast?: number;
    saturation?: number;
    temperature?: number;
    tint?: number;
    highlights?: number;
    shadows?: number;
  };
}

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaStroke {
  strokeAlign?: 'INSIDE' | 'CENTER' | 'OUTSIDE';
  strokeCap?: 'NONE' | 'ROUND' | 'SQUARE' | 'LINE_ARROW' | 'TRIANGLE_ARROW';
  strokeJoin?: 'MITER' | 'BEVEL' | 'ROUND';
  strokeMiterLimit?: number;
  strokeWeight?: number;
  strokeDashes?: number[];
  blendMode?: string;
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'EMOJI';
  color?: FigmaColor;
  opacity?: number;
}

export interface FigmaEffect {
  type: 'INNER_SHADOW' | 'DROP_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible?: boolean;
  radius: number;
  color?: FigmaColor;
  offset?: {
    x: number;
    y: number;
  };
  spread?: number;
  showShadowBehindNode?: boolean;
  blendMode?: string;
}

export interface FigmaExportSetting {
  suffix: string;
  format: 'JPG' | 'PNG' | 'SVG' | 'PDF';
  constraint: {
    type: 'SCALE' | 'WIDTH' | 'HEIGHT';
    value: number;
  };
}

export interface FigmaGuide {
  isXAxis: boolean;
  offset: number;
}

export interface FigmaImageResponse {
  err?: string;
  images: Record<string, string | null>;
}

export interface FigmaVariablesResponse {
  variables: Record<string, FigmaVariable>;
  variableCollections: Record<
    string,
    {
      id: string;
      name: string;
      modes: Array<{
        modeId: string;
        name: string;
      }>;
      defaultModeId: string;
      remote: boolean;
      key: string;
    }
  >;
}
