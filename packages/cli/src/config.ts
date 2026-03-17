import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Supported target platforms for code generation
 */
export type Platform = 'web' | 'ios' | 'android';

/**
 * Configuration for a ULE project
 */
export interface UleConfig {
  version: string;
  figmaFileId?: string;
  figmaAccessToken?: string;
  platforms: Platform[];
  outputDir: string;
  tokenDir: string;
  componentMapPath?: string;
  tokenPalette?: string;
  validation?: {
    rules: ('anti-patterns' | 'a11y' | 'structure')[];
    strictMode?: boolean;
  };
  preview?: {
    port: number;
    autoOpen?: boolean;
  };
}

/**
 * Default configuration for new projects
 */
export const DEFAULT_CONFIG: UleConfig = {
  version: '0.1.0',
  platforms: ['web'],
  outputDir: './dist',
  tokenDir: './tokens',
  validation: {
    rules: ['anti-patterns', 'a11y', 'structure'],
    strictMode: false,
  },
  preview: {
    port: 3000,
    autoOpen: true,
  },
};

/**
 * Load ULE configuration from ule.config.json
 *
 * @param projectRoot - Project root directory (defaults to current working directory)
 * @returns Merged configuration (defaults + user config)
 * @throws {Error} If configuration file is invalid JSON
 */
export async function loadConfig(projectRoot: string = process.cwd()): Promise<UleConfig> {
  const configPath = path.join(projectRoot, 'ule.config.json');

  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const userConfig = JSON.parse(configContent) as Partial<UleConfig>;

    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
      validation: {
        rules: userConfig.validation?.rules ?? DEFAULT_CONFIG.validation!.rules,
        strictMode: userConfig.validation?.strictMode ?? DEFAULT_CONFIG.validation!.strictMode,
      },
      preview: {
        port: userConfig.preview?.port ?? DEFAULT_CONFIG.preview!.port,
        autoOpen: userConfig.preview?.autoOpen ?? DEFAULT_CONFIG.preview!.autoOpen,
      },
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return DEFAULT_CONFIG;
    }

    if (error instanceof SyntaxError) {
      throw new Error(`Invalid ule.config.json: ${error.message}`);
    }

    throw error;
  }
}

/**
 * Write ULE configuration to ule.config.json
 *
 * @param config - Configuration to write
 * @param projectRoot - Project root directory (defaults to current working directory)
 */
export async function saveConfig(
  config: Partial<UleConfig>,
  projectRoot: string = process.cwd()
): Promise<void> {
  const configPath = path.join(projectRoot, 'ule.config.json');
  const merged = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  await fs.writeFile(configPath, JSON.stringify(merged, null, 2), 'utf-8');
}

/**
 * Validate configuration schema
 *
 * @param config - Configuration to validate
 * @throws {Error} If configuration is invalid
 */
export function validateConfig(config: UleConfig): void {
  if (!config.version) {
    throw new Error('Missing required field: version');
  }

  if (!Array.isArray(config.platforms) || config.platforms.length === 0) {
    throw new Error('platforms must be a non-empty array');
  }

  const validPlatforms: Platform[] = ['web', 'ios', 'android'];
  for (const platform of config.platforms) {
    if (!validPlatforms.includes(platform)) {
      throw new Error(`Invalid platform: ${platform}`);
    }
  }

  if (!config.outputDir) {
    throw new Error('Missing required field: outputDir');
  }

  if (!config.tokenDir) {
    throw new Error('Missing required field: tokenDir');
  }
}
