import { Tool } from '@modelcontextprotocol/sdk/server/index.js';

/**
 * Tool input arguments for generate code
 */
interface GenerateCodeInput {
  ir: string;
  platforms: string[];
  palette?: string;
}

/**
 * Generated code output
 */
interface GeneratedCode {
  platform: string;
  files: Array<{
    path: string;
    content: string;
    language: string;
  }>;
  metadata: {
    componentsCount: number;
    tokensUsed: string[];
    generatedAt: string;
  };
}

/**
 * Generate platform code from Intermediate Representation
 *
 * This tool:
 * 1. Parses IR JSON input
 * 2. Validates IR against schema
 * 3. Resolves tokens for each platform
 * 4. Calls appropriate renderer (web, iOS, Android)
 * 5. Returns generated code files
 *
 * Supported platforms:
 * - web: React/TypeScript + CSS modules
 * - ios: SwiftUI
 * - android: Jetpack Compose
 */
export const generateCodeTool: Tool & {
  handler: (input: GenerateCodeInput) => Promise<GeneratedCode[]>;
} = {
  name: 'ule_generate_code',
  description: 'Generate platform code from Intermediate Representation (IR) JSON',
  inputSchema: {
    type: 'object' as const,
    properties: {
      ir: {
        type: 'string',
        description: 'IR JSON as string (can be JSON stringified)',
      },
      platforms: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['web', 'ios', 'android'],
        },
        description: 'Target platforms for code generation',
      },
      palette: {
        type: 'string',
        description: 'Optional color palette variant (default: "default")',
      },
    },
    required: ['ir', 'platforms'],
  },

  handler: async (input: GenerateCodeInput): Promise<GeneratedCode[]> => {
    const { ir, platforms, palette = 'default' } = input;

    // Parse IR JSON
    let irData: unknown;
    try {
      irData = typeof ir === 'string' ? JSON.parse(ir) : ir;
    } catch (error) {
      throw new Error(`Invalid IR JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // TODO: Implement actual code generation
    // 1. Validate IR against schema
    // 2. For each platform:
    //    a. Resolve tokens (colors, spacing, typography) for platform
    //    b. Call platform-specific renderer:
    //       - web: WebRenderer.render(ir, tokens)
    //       - ios: iOSRenderer.render(ir, tokens)
    //       - android: AndroidRenderer.render(ir, tokens)
    //    c. Generate code files
    //    d. Format code (prettier, etc.)
    // 3. Return generated code map

    // Sample generated code
    const generatedCode: GeneratedCode[] = [];

    for (const platform of platforms) {
      const files = generateFilesForPlatform(platform);
      generatedCode.push({
        platform,
        files,
        metadata: {
          componentsCount: 5,
          tokensUsed: ['$-color-primary', '$-spacing-md', '$-font-body'],
          generatedAt: new Date().toISOString(),
        },
      });
    }

    return generatedCode;
  },
};

/**
 * Generate sample code files for a platform
 */
function generateFilesForPlatform(platform: string): Array<{
  path: string;
  content: string;
  language: string;
}> {
  switch (platform) {
    case 'web': {
      return [
        {
          path: 'components/Button.tsx',
          language: 'typescript',
          content: `import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  onClick
}) => {
  return (
    <button
      className={\`\${styles.button} \${styles[\`button-\${variant}\`]}\`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
`,
        },
        {
          path: 'components/Button.module.css',
          language: 'css',
          content: `.button {
  padding: var(--mka-spacing-md);
  border-radius: var(--mka-radius-md);
  font-family: var(--mka-font-body);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.button-primary {
  background-color: var(--mka-color-primary);
  color: var(--mka-color-on-primary);
}

.button-secondary {
  background-color: var(--mka-color-secondary);
  color: var(--mka-color-on-secondary);
}
`,
        },
      ];
    }

    case 'ios': {
      return [
        {
          path: 'Components/Button.swift',
          language: 'swift',
          content: `import SwiftUI

struct KatogUIButton: View {
  let label: String
  var variant: ButtonVariant = .primary
  var action: (() -> Void)? = nil

  var body: some View {
    Button(action: { action?() }) {
      Text(label)
        .font(.system(size: 16, weight: .semibold))
        .foregroundColor(variant.foregroundColor)
        .padding(.vertical, Tokens.spacing.md)
        .padding(.horizontal, Tokens.spacing.lg)
        .frame(maxWidth: .infinity)
        .background(variant.backgroundColor)
        .cornerRadius(Tokens.radius.md)
    }
  }
}

enum ButtonVariant {
  case primary
  case secondary

  var backgroundColor: Color {
    switch self {
    case .primary: return Color(red: 0.2, green: 0.4, blue: 0.9)
    case .secondary: return Color(red: 0.9, green: 0.9, blue: 0.9)
    }
  }

  var foregroundColor: Color {
    switch self {
    case .primary: return .white
    case .secondary: return .black
    }
  }
}
`,
        },
      ];
    }

    case 'android': {
      return [
        {
          path: 'composables/Button.kt',
          language: 'kotlin',
          content: `package com.mkatogui.components

import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun KatogUIButton(
  label: String,
  variant: ButtonVariant = ButtonVariant.Primary,
  onClick: () -> Unit = {}
) {
  Button(
    onClick = onClick,
    colors = ButtonDefaults.buttonColors(
      containerColor = variant.backgroundColor,
      contentColor = variant.foregroundColor
    ),
    modifier = androidx.compose.foundation.layout.Modifier
      .padding(vertical = 8.dp, horizontal = 12.dp)
  ) {
    Text(
      text = label,
      fontSize = 16.sp
    )
  }
}

enum class ButtonVariant(
  val backgroundColor: Color,
  val foregroundColor: Color
) {
  Primary(Color(0xFF3366FF), Color.White),
  Secondary(Color(0xFFE6E6E6), Color.Black)
}
`,
        },
      ];
    }

    default:
      return [];
  }
}
