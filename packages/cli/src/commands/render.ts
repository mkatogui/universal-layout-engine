import * as fs from 'fs/promises';
import * as path from 'path';
import { Command } from 'commander';
import type { IRDocument } from '@mkatogui/ule-core';
import { WebRenderer } from '@mkatogui/ule-renderers';

/**
 * Options for render command
 */
interface RenderOptions {
  ir?: string;
  platform?: string;
  out?: string;
}

/**
 * Render IR JSON to platform-specific code (no Figma required)
 *
 * Workflow:
 * 1. Load IR JSON from file
 * 2. Validate structure
 * 3. Run platform renderer
 * 4. Write output files
 *
 * Use this when you have IR from another source or wrote it manually.
 */
export async function renderCommand(
  this: Command,
  options: RenderOptions
): Promise<void> {
  try {
    const irPath = options.ir || './ir.json';
    const platform = options.platform || 'web';
    const outputDir = options.out || './dist';

    if (platform !== 'web') {
      console.error(`Error: Only 'web' platform is supported for render command`);
      console.error('Use ule generate for full multi-platform pipeline with Figma');
      process.exit(1);
    }

    console.log('Rendering IR to platform code...\n');
    console.log(`IR file: ${irPath}`);
    console.log(`Platform: ${platform}`);
    console.log(`Output: ${outputDir}\n`);

    // Load IR
    let irContent: string;
    try {
      irContent = await fs.readFile(irPath, 'utf-8');
    } catch (err) {
      console.error(`Error: Could not read IR file at ${irPath}`);
      console.error('Run from project root or use --ir <path> to specify location');
      process.exit(1);
    }

    const doc: IRDocument = JSON.parse(irContent) as IRDocument;

    if (!doc.version || !doc.frames || !Array.isArray(doc.frames)) {
      console.error('Error: Invalid IR structure. Expected version, meta, and frames.');
      process.exit(1);
    }

    // Render
    const renderer = new WebRenderer();
    const files = renderer.renderDocument(doc);

    // Write output
    await fs.mkdir(outputDir, { recursive: true });

    for (const [filename, content] of files) {
      const outPath = path.join(outputDir, filename);
      await fs.writeFile(outPath, content, 'utf-8');
      console.log(`  ✓ ${outPath}`);
    }

    console.log(`\n✓ Rendered ${files.size} file(s) to ${outputDir}`);
    console.log('\nNext: Import the generated component in your app, or run:');
    console.log(`  ule preview --ir ${irPath} --platform web`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('Unknown error during render');
    }
    process.exit(1);
  }
}
