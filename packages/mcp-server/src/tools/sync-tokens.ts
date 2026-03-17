import { Tool } from '@modelcontextprotocol/sdk/server/index.js';

/**
 * Tool input arguments for sync tokens
 */
interface SyncTokensInput {
  formats: string[];
  palette?: string;
}

/**
 * Token file output
 */
interface TokenFile {
  format: string;
  filename: string;
  content: string;
}

/**
 * Synchronize UDS tokens to output formats
 *
 * This tool:
 * 1. Loads token definitions from @mkatogui/uds-tokens
 * 2. Applies palette transformations if specified
 * 3. Generates token files in requested formats
 * 4. Returns content ready to be written to files
 *
 * Supported formats:
 * - css: CSS custom properties (--mka-*)
 * - swift: Swift constants (KatogUITokens.swift)
 * - compose: Jetpack Compose objects (Tokens.kt)
 * - json: Raw JSON representation
 */
export const syncTokensTool: Tool & {
  handler: (input: SyncTokensInput) => Promise<TokenFile[]>;
} = {
  name: 'ule_sync_tokens',
  description: 'Synchronize UDS tokens to output formats (CSS, Swift, Compose, JSON)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      formats: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['css', 'swift', 'compose', 'json'],
        },
        description: 'Output formats for token generation',
      },
      palette: {
        type: 'string',
        description: 'Optional color palette variant (default: "default")',
      },
    },
    required: ['formats'],
  },

  handler: async (input: SyncTokensInput): Promise<TokenFile[]> => {
    const { formats, palette = 'default' } = input;

    // TODO: Implement actual token loading and transformation
    // 1. Load tokens from @mkatogui/uds-tokens
    // 2. Apply palette variant (if specified)
    // 3. For each format, generate appropriate output
    // 4. Return token files

    const tokenFiles: TokenFile[] = [];

    for (const format of formats) {
      const tokenFile = generateTokenFile(format, palette);
      tokenFiles.push(tokenFile);
    }

    return tokenFiles;
  },
};

/**
 * Generate token file content for a specific format
 */
function generateTokenFile(format: string, palette: string): TokenFile {
  switch (format) {
    case 'css': {
      return {
        format: 'css',
        filename: 'tokens.css',
        content: `:root {
  /* Colors */
  --mka-color-primary: #3366ff;
  --mka-color-primary-hover: #1a4dd9;
  --mka-color-secondary: #f0f0f0;
  --mka-color-secondary-hover: #e0e0e0;
  --mka-color-surface: #ffffff;
  --mka-color-surface-alt: #f9f9f9;
  --mka-color-on-primary: #ffffff;
  --mka-color-on-secondary: #000000;

  /* Spacing */
  --mka-spacing-xs: 4px;
  --mka-spacing-sm: 8px;
  --mka-spacing-md: 12px;
  --mka-spacing-lg: 16px;
  --mka-spacing-xl: 24px;

  /* Border Radius */
  --mka-radius-sm: 4px;
  --mka-radius-md: 8px;
  --mka-radius-lg: 12px;
  --mka-radius-xl: 16px;

  /* Typography */
  --mka-font-family-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --mka-font-family-mono: "Monaco", "Menlo", "Courier New", monospace;
  --mka-font-size-sm: 12px;
  --mka-font-size-body: 16px;
  --mka-font-size-lg: 18px;
  --mka-font-weight-normal: 400;
  --mka-font-weight-semibold: 600;
  --mka-font-weight-bold: 700;

  /* Shadows */
  --mka-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --mka-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --mka-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

${palette !== 'default' ? `/* Palette: ${palette} */\n:root[data-palette="${palette}"] {\n  /* Palette-specific overrides */\n}\n` : ''}`,
      };
    }

    case 'swift': {
      return {
        format: 'swift',
        filename: 'Tokens.swift',
        content: `import Foundation
import SwiftUI

struct KatogUITokens {
  // MARK: - Colors

  struct Colors {
    static let primary = Color(red: 0.2, green: 0.4, blue: 1.0)
    static let primaryHover = Color(red: 0.1, green: 0.3, blue: 0.85)
    static let secondary = Color(red: 0.94, green: 0.94, blue: 0.94)
    static let secondaryHover = Color(red: 0.88, green: 0.88, blue: 0.88)
    static let surface = Color.white
    static let surfaceAlt = Color(red: 0.98, green: 0.98, blue: 0.98)
    static let onPrimary = Color.white
    static let onSecondary = Color.black
  }

  // MARK: - Spacing

  struct Spacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 24
  }

  // MARK: - Border Radius

  struct Radius {
    static let sm: CGFloat = 4
    static let md: CGFloat = 8
    static let lg: CGFloat = 12
    static let xl: CGFloat = 16
  }

  // MARK: - Typography

  struct Typography {
    static let bodyFont = Font.system(.body, design: .default)
    static let monoFont = Font.system(.body, design: .monospaced)

    static let fontSizes = (
      small: CGFloat(12),
      body: CGFloat(16),
      large: CGFloat(18)
    )

    static let fontWeights = (
      normal: Font.Weight.regular,
      semibold: Font.Weight.semibold,
      bold: Font.Weight.bold
    )
  }

  // MARK: - Shadows

  struct Shadows {
    static let sm = Shadow(color: .black.opacity(0.05), radius: 1, x: 0, y: 1)
    static let md = Shadow(color: .black.opacity(0.1), radius: 6, x: 0, y: 4)
    static let lg = Shadow(color: .black.opacity(0.1), radius: 15, x: 0, y: 10)
  }
}
`,
      };
    }

    case 'compose': {
      return {
        format: 'compose',
        filename: 'Tokens.kt',
        content: `package com.mkatogui.theme

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object KatogUITokens {
  // Colors
  object Colors {
    val primary = Color(0xFF3366FF)
    val primaryHover = Color(0xFF1A4DD9)
    val secondary = Color(0xFFF0F0F0)
    val secondaryHover = Color(0xFFE0E0E0)
    val surface = Color.White
    val surfaceAlt = Color(0xFFFAFAFA)
    val onPrimary = Color.White
    val onSecondary = Color.Black
  }

  // Spacing
  object Spacing {
    val xs = 4.dp
    val sm = 8.dp
    val md = 12.dp
    val lg = 16.dp
    val xl = 24.dp
  }

  // Border Radius
  object Radius {
    val sm = 4.dp
    val md = 8.dp
    val lg = 12.dp
    val xl = 16.dp
  }

  // Typography
  object Typography {
    val fontSizeSm = 12.sp
    val fontSizeBody = 16.sp
    val fontSizeLg = 18.sp

    val fontWeightNormal = 400
    val fontWeightSemibold = 600
    val fontWeightBold = 700
  }

  // Shadows
  object Shadows {
    // Note: Compose shadow implementation in Shape/Modifier
    val shadowSmBlur = 2.dp
    val shadowMdBlur = 6.dp
    val shadowLgBlur = 15.dp
  }
}
`,
      };
    }

    case 'json': {
      return {
        format: 'json',
        filename: 'tokens.json',
        content: JSON.stringify(
          {
            colors: {
              primary: '#3366ff',
              primaryHover: '#1a4dd9',
              secondary: '#f0f0f0',
              secondaryHover: '#e0e0e0',
              surface: '#ffffff',
              surfaceAlt: '#f9f9f9',
              onPrimary: '#ffffff',
              onSecondary: '#000000',
            },
            spacing: {
              xs: '4px',
              sm: '8px',
              md: '12px',
              lg: '16px',
              xl: '24px',
            },
            radius: {
              sm: '4px',
              md: '8px',
              lg: '12px',
              xl: '16px',
            },
            typography: {
              fontFamily: {
                body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                mono: '"Monaco", "Menlo", "Courier New", monospace',
              },
              fontSize: {
                sm: '12px',
                body: '16px',
                lg: '18px',
              },
              fontWeight: {
                normal: 400,
                semibold: 600,
                bold: 700,
              },
            },
            shadows: {
              sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
              md: '0 4px 6px rgba(0, 0, 0, 0.1)',
              lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
            },
            palette,
          },
          null,
          2
        ),
      };
    }

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
