import * as fs from 'fs/promises';
import * as path from 'path';
import { Command } from 'commander';
import { saveConfig, DEFAULT_CONFIG, validateConfig } from '../config.js';

/**
 * Initialize a new ULE project with default configuration and directory structure
 *
 * Creates:
 * - ule.config.json with sensible defaults
 * - Output directories for generated code and tokens
 * - Displays welcome message with next steps
 *
 * @param options - Command options
 * @param options.platforms - Target platforms (default: 'web')
 */
export async function initCommand(
  this: Command,
  options: { platforms?: string }
): Promise<void> {
  const projectRoot = process.cwd();
  const configPath = path.join(projectRoot, 'ule.config.json');

  try {
    // Check if config already exists
    try {
      await fs.access(configPath);
      console.error('Error: ule.config.json already exists in this directory');
      process.exit(1);
    } catch {
      // Config doesn't exist, proceed
    }

    // Parse platforms
    const platforms = options.platforms
      ? (options.platforms.split(',').map((p) => p.trim()) as any[])
      : DEFAULT_CONFIG.platforms;

    // Create configuration
    const config = {
      version: '0.1.0',
      platforms,
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

    // Validate configuration
    validateConfig(config);

    // Save configuration
    await saveConfig(config, projectRoot);

    // Create output directories
    const dirs = [config.outputDir, config.tokenDir];
    for (const dir of dirs) {
      const fullPath = path.join(projectRoot, dir);
      try {
        await fs.mkdir(fullPath, { recursive: true });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
          throw error;
        }
      }
    }

    // Print welcome message
    console.log('\n✓ ULE project initialized successfully!\n');
    console.log('Configuration created: ule.config.json');
    console.log(`Platforms: ${platforms.join(', ')}`);
    console.log(`Output directory: ${config.outputDir}`);
    console.log(`Token directory: ${config.tokenDir}`);

    console.log('\nNext steps:');
    console.log('  1. Add your Figma file ID to ule.config.json');
    console.log('  2. Set FIGMA_ACCESS_TOKEN environment variable');
    console.log('  3. Run: ule generate --file <FIGMA_ID>');

    if (platforms.includes('web')) {
      console.log('  4. Run: ule preview --ir ./dist/web/ir.json');
    }

    console.log('\nDocumentation: https://github.com/mkatogui/universal-layout-engine\n');
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('Unknown error during initialization');
    }
    process.exit(1);
  }
}
