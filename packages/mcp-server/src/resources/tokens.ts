/**
 * UDS Token Definitions Resource
 *
 * Provides access to all Universal Design System token values
 * in a structured, resolved format.
 *
 * Token categories:
 * - Colors: Brand colors, semantic colors, state colors
 * - Spacing: Padding, margin, gap values
 * - Radius: Border radius values for different contexts
 * - Typography: Font families, sizes, weights, line heights
 * - Shadows: Elevation shadows for different depths
 * - Transitions: Animation durations and easing functions
 */

interface TokenResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  getContent: () => Promise<string>;
}

/**
 * Complete UDS token definitions
 */
const TOKEN_DEFINITIONS = {
  version: '1.0.0',
  tokens: {
    colors: {
      primary: '#3366ff',
      primaryHover: '#1a4dd9',
      primaryActive: '#0d33b2',
      primaryDisabled: '#cce0ff',

      secondary: '#f0f0f0',
      secondaryHover: '#e0e0e0',
      secondaryActive: '#d0d0d0',
      secondaryDisabled: '#f9f9f9',

      surface: '#ffffff',
      surfaceAlt: '#f9f9f9',
      surfaceHover: '#f0f0f0',

      error: '#e53935',
      errorLight: '#ffcdd2',

      warning: '#fb8c00',
      warningLight: '#ffe0b2',

      success: '#43a047',
      successLight: '#c8e6c9',

      info: '#1e88e5',
      infoLight: '#bbdefb',

      onPrimary: '#ffffff',
      onSecondary: '#000000',
      onSurface: '#1a1a1a',
      onError: '#ffffff',
    },

    spacing: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      '2xl': '32px',
      '3xl': '48px',
    },

    radius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },

    typography: {
      fontFamily: {
        body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        mono: '"Monaco", "Menlo", "Courier New", monospace',
      },

      fontSize: {
        xs: '12px',
        sm: '14px',
        body: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },

      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },

      lineHeight: {
        tight: '1.2',
        normal: '1.5',
        relaxed: '1.75',
        loose: '2',
      },

      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.02em',
      },
    },

    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
    },

    transitions: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',

      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },

    zIndex: {
      hide: -1,
      auto: 0,
      base: 0,
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      backdrop: 1040,
      modal: 1050,
      popover: 1060,
      tooltip: 1070,
    },
  },

  // Token references used in components
  componentTokens: {
    button: {
      primary: {
        background: '$color-brand',
        color: '$color-bg-primary',
        padding: '$space-3 $space-4',
        borderRadius: '$space-2',
        fontSize: '$font-size-md',
        fontWeight: '$font-weight-bold',
        shadow: '$opacity-subtle',
        transition: '$duration-normal $easing-standard',
      },
      secondary: {
        background: '$color-bg-secondary',
        color: '$color-text-primary',
        padding: '$space-3 $space-4',
        borderRadius: '$space-2',
      },
    },

    input: {
      base: {
        padding: '$space-2 $space-3',
        borderRadius: '$space-2',
        fontSize: '$font-size-md',
        fontFamily: '$font-size-md',
        border: '1px solid #ccc',
      },
    },

    card: {
      base: {
        background: '$color-bg-surface',
        borderRadius: '$space-3',
        padding: '$space-4',
        shadow: '$opacity-muted',
      },
    },
  },
};

/**
 * Resource that provides UDS token definitions
 */
export const tokensResource: TokenResource = {
  uri: 'ule://tokens',
  name: 'UDS Tokens',
  description: 'Universal Design System token definitions',
  mimeType: 'application/json',
  async getContent(): Promise<string> {
    return JSON.stringify(TOKEN_DEFINITIONS, null, 2);
  },
};
