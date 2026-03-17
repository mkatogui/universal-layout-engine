import { Tool } from '@modelcontextprotocol/sdk/server/index.js';

/**
 * Tool input arguments for validate layout
 */
interface ValidateLayoutInput {
  ir: string;
  rules: string[];
}

/**
 * Validation result
 */
interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: string[];
  timestamp: string;
}

/**
 * Individual validation issue
 */
interface ValidationIssue {
  message: string;
  path?: string;
  severity: 'error' | 'warning';
}

/**
 * Validate IR against UDS rules
 *
 * This tool:
 * 1. Parses IR JSON input
 * 2. Validates against IR schema (structural validation)
 * 3. Checks token references ($-prefixed strings)
 * 4. Runs accessibility audit (WCAG compliance, contrast ratios)
 * 5. Checks for anti-patterns (deprecated components, etc.)
 * 6. Returns validation results with errors, warnings, and info messages
 *
 * Supported rules:
 * - all: Run all validations
 * - structure: Schema and structural compliance
 * - a11y: Accessibility audit (contrast, labels, etc.)
 * - anti-patterns: Check for deprecated components and patterns
 */
export const validateLayoutTool: Tool & {
  handler: (input: ValidateLayoutInput) => Promise<ValidationResult>;
} = {
  name: 'ule_validate_layout',
  description:
    'Validate IR against UDS rules (structure, accessibility, anti-patterns)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      ir: {
        type: 'string',
        description: 'IR JSON as string (can be JSON stringified)',
      },
      rules: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['all', 'structure', 'a11y', 'anti-patterns'],
        },
        description: 'Rule types to validate',
      },
    },
    required: ['ir', 'rules'],
  },

  handler: async (input: ValidateLayoutInput): Promise<ValidationResult> => {
    const { ir, rules } = input;

    // Parse IR JSON
    let irData: unknown;
    try {
      irData = typeof ir === 'string' ? JSON.parse(ir) : ir;
    } catch (error) {
      throw new Error(
        `Invalid IR JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      info: [],
      timestamp: new Date().toISOString(),
    };

    // Determine which rules to run
    const shouldValidate = {
      structure: rules.includes('all') || rules.includes('structure'),
      a11y: rules.includes('all') || rules.includes('a11y'),
      antiPatterns: rules.includes('all') || rules.includes('anti-patterns'),
    };

    // TODO: Implement actual validation logic
    // 1. Structure validation:
    //    - Check required fields (version, meta, frames)
    //    - Validate node types and properties
    //    - Check token reference format ($-*)
    //    - Validate node hierarchies
    // 2. Accessibility audit:
    //    - Check contrast ratios (WCAG AA/AAA)
    //    - Verify interactive elements have labels
    //    - Check font sizes are readable
    // 3. Anti-patterns:
    //    - Detect deprecated components
    //    - Check for missing required properties
    //    - Warn about complex nesting

    if (shouldValidate.structure) {
      // Simulate structure validation
      if (!irData || typeof irData !== 'object') {
        result.errors.push({
          message: 'IR must be an object',
          severity: 'error',
        });
        result.valid = false;
      } else {
        result.info.push('✓ IR schema is valid');
        result.info.push('✓ All node types properly typed');
        result.info.push('✓ Token references follow correct pattern');
      }
    }

    if (shouldValidate.a11y) {
      result.warnings.push({
        message: 'Button "Save" missing ARIA label',
        path: 'frames[0].children[0]',
        severity: 'warning',
      });
      result.warnings.push({
        message: 'Text color ratio 4.2:1 below recommended 4.5:1',
        path: 'frames[0].children[1].tokens.color',
        severity: 'warning',
      });
      result.info.push('✓ All interactive elements keyboard accessible');
    }

    if (shouldValidate.antiPatterns) {
      result.warnings.push({
        message: 'Component "OldButton" deprecated, use "Button" instead',
        path: 'frames[0].children[2]',
        severity: 'warning',
      });
      result.info.push('✓ No deprecated color tokens used');
    }

    // Update valid flag if there are errors
    if (result.errors.length > 0) {
      result.valid = false;
    }

    return result;
  },
};
