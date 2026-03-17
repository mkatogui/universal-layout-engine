#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { generateCommand } from './commands/generate.js';
import { syncTokensCommand } from './commands/sync-tokens.js';
import { validateCommand } from './commands/validate.js';
import { exportIrCommand } from './commands/export-ir.js';
import { mapComponentsCommand } from './commands/map-components.js';
import { previewCommand } from './commands/preview.js';
import { diffCommand } from './commands/diff.js';

/**
 * Universal Layout Engine CLI
 *
 * Transform Figma designs into multi-platform code with token management,
 * validation, and preview capabilities.
 */
const program = new Command()
  .name('ule')
  .description('Universal Layout Engine - Transform Figma designs into multi-platform code')
  .version('0.1.0', '-v, --version')
  .helpOption('-h, --help');

/**
 * Initialize a new ULE project with default configuration
 */
program
  .command('init')
  .description('Initialize a new ULE project with configuration')
  .action(initCommand);

/**
 * Generate platform code from Figma design
 */
program
  .command('generate')
  .description('Generate platform code from Figma frames')
  .option('--file <url>', 'Figma file URL or ID')
  .option('--to <platforms>', 'Target platforms (comma-separated: web,ios,android)', 'web')
  .option('--out <dir>', 'Output directory', './dist')
  .option('--palette <name>', 'Color palette variant')
  .action(generateCommand);

/**
 * Synchronize UDS tokens to output formats
 */
program
  .command('sync-tokens')
  .description('Synchronize UDS tokens to project outputs')
  .option('--format <formats>', 'Output formats (css,swift,compose,json)', 'css,json')
  .option('--out <dir>', 'Output directory', './tokens')
  .option('--palette <name>', 'Color palette variant')
  .option('--check', 'Check if tokens are in sync (exit non-zero if not)')
  .action(syncTokensCommand);

/**
 * Validate Figma design or IR against UDS rules
 */
program
  .command('validate')
  .description('Validate Figma design or IR against UDS rules')
  .option('--file <url>', 'Figma file URL or ID')
  .option('--ir <path>', 'Local IR JSON file path')
  .option('--rules <types>', 'Rule types (all|anti-patterns|a11y|structure)', 'all')
  .action(validateCommand);

/**
 * Export Figma frames as intermediate representation
 */
program
  .command('export-ir')
  .description('Export Figma frames as IR JSON')
  .requiredOption('--file <url>', 'Figma file URL or ID')
  .option('--frame <name>', 'Specific frame name to export')
  .option('--page <name>', 'Specific page to export')
  .option('--out <path>', 'Output file path', './ir.json')
  .action(exportIrCommand);

/**
 * Generate or update component mapping
 */
program
  .command('map-components')
  .description('Generate or update component mapping from Figma')
  .option('--file <url>', 'Figma file URL or ID')
  .option('--out <path>', 'Output file path', './component-map.json')
  .option('--suggest', 'Auto-detect components and suggest mappings')
  .action(mapComponentsCommand);

/**
 * Launch development preview server
 */
program
  .command('preview')
  .description('Launch development preview server')
  .option('--ir <path>', 'IR JSON file path', './ir.json')
  .option('--platform <name>', 'Platform to preview (web|ios|android)', 'web')
  .option('--port <number>', 'Server port', '3000')
  .action(previewCommand);

/**
 * Compare two IR snapshots for changes
 */
program
  .command('diff')
  .description('Compare two IR JSON snapshots')
  .requiredOption('--from <path>', 'First IR JSON file path')
  .requiredOption('--to <path>', 'Second IR JSON file path')
  .option('--format <type>', 'Output format (summary|detailed|json)', 'summary')
  .action(diffCommand);

program.parse(process.argv);

if (process.argv.length < 3) {
  program.outputHelp();
}
