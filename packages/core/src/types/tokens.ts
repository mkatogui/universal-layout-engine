/**
 * UDS Design Token References
 *
 * All token references use the $ prefix and resolve to
 * @mkatogui/uds-tokens values at render time.
 */

/** A token reference string, always prefixed with $ */
export type TokenRef = `$${string}`;

/** Raw CSS/platform value (px, pt, dp, rem, hex, etc.) */
export type RawValue = string | number;

/** Either a token reference or a raw value */
export type TokenOrValue = TokenRef | RawValue;

/** UDS spacing tokens ($space-1 through $space-24, 4px grid) */
export type SpacingToken =
  | '$space-1' | '$space-2' | '$space-3' | '$space-4'
  | '$space-5' | '$space-6' | '$space-8' | '$space-10'
  | '$space-12' | '$space-16' | '$space-20' | '$space-24';

/** UDS color tokens (semantic tier) */
export type ColorToken =
  | '$color-brand' | '$color-brand-hover' | '$color-brand-active'
  | '$color-bg-primary' | '$color-bg-secondary' | '$color-bg-surface'
  | '$color-text-primary' | '$color-text-secondary' | '$color-text-muted'
  | '$color-border' | '$color-border-strong'
  | '$color-success' | '$color-warning' | '$color-error' | '$color-info'
  | TokenRef;

/** UDS typography tokens */
export type TypographyToken =
  | '$font-size-xs' | '$font-size-sm' | '$font-size-md'
  | '$font-size-lg' | '$font-size-xl' | '$font-size-2xl'
  | '$font-size-3xl' | '$font-size-4xl'
  | '$font-weight-normal' | '$font-weight-medium' | '$font-weight-bold'
  | '$line-height-tight' | '$line-height-normal' | '$line-height-relaxed'
  | TokenRef;

/** UDS layout tokens */
export type LayoutToken =
  | '$container-max' | '$container-narrow' | '$container-padding'
  | '$section-gap'
  | TokenRef;

/** UDS z-index tokens */
export type ZIndexToken =
  | '$z-dropdown' | '$z-sticky' | '$z-overlay'
  | '$z-modal' | '$z-toast' | '$z-tooltip' | '$z-system'
  | TokenRef;

/** UDS motion tokens */
export type MotionToken =
  | '$duration-fast' | '$duration-normal' | '$duration-slow' | '$duration-slower'
  | '$easing-standard' | '$easing-decelerate' | '$easing-accelerate'
  | TokenRef;

/** UDS palette names */
export type UdsPalette =
  | 'minimal-saas'
  | 'ai-futuristic'
  | 'gradient-startup'
  | 'corporate'
  | 'apple-minimal'
  | 'illustration'
  | 'dashboard'
  | 'bold-lifestyle'
  | 'minimal-corporate'
  | string; // Custom palettes

/** Target platform for token resolution */
export type Platform = 'web' | 'ios' | 'android' | 'desktop';

/** Token format for output */
export type TokenFormat = 'css' | 'swift' | 'compose' | 'json' | 'scss';

/** Resolved token value for a specific platform */
export interface ResolvedToken {
  name: string;
  ref: TokenRef;
  value: RawValue;
  platform: Platform;
  format: TokenFormat;
  tier: 'primitive' | 'semantic' | 'palette';
}

/** Complete token dictionary */
export interface TokenDictionary {
  version: string;
  palette: UdsPalette;
  tokens: Record<string, ResolvedToken>;
}
