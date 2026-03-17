# Universal Layout Engine (ULE)

> Convert Figma designs into production-ready layouts for Web, iOS, Android, and Desktop — powered by the [@mkatogui/universal-design-system](https://www.npmjs.com/package/@mkatogui/universal-design-system).

## What is ULE?

The Universal Layout Engine is a cross-platform layout generation system that takes Figma designs and produces native application layouts. It uses a platform-agnostic **Intermediate Representation (IR)** — a JSON tree of layout nodes — that can be rendered to any target platform while preserving design token integrity from the Universal Design System.

### Key Features

- **Figma → IR extraction** via REST API, MCP Server, and Code Connect
- **10 IR node types**: Frame, Stack, Grid, Scroll, Component, Text, Image, Spacer, Conditional, Slot
- **4 platform renderers**: React/CSS, SwiftUI, Jetpack Compose, Electron/Tauri
- **Token-first architecture**: All values use `$`-prefixed UDS token references resolved per platform
- **IR validation** with structural checks, token integrity, and WCAG accessibility rules
- **AI-native MCP Server** exposing layout tools to Claude and other AI agents
- **CLI** for end-to-end generation, token sync, preview, and diff

## Monorepo Structure

```
packages/
├── core/               # @mkatogui/ule-core — IR types, tree utils, token resolver, validation
├── figma-connector/    # @mkatogui/ule-figma-connector — Figma REST + MCP + Code Connect
├── renderers/          # @mkatogui/ule-renderers — Web, iOS, Android, Desktop renderers
├── cli/                # @mkatogui/ule-cli — Command-line interface
└── mcp-server/         # @mkatogui/ule-mcp — Model Context Protocol server
schemas/
├── ir.schema.json      # JSON Schema for IR documents
└── component-map.json  # Figma ↔ UDS component mappings (37 components)
```

## Quick Start

```bash
# Install dependencies
npm install

# Build all packages
npx turbo build

# Initialize a project
npx ule init

# With Figma: generate layouts from design
npx ule generate --file <FILE_ID> --to web

# Without Figma: render IR JSON directly
npx ule render --ir examples/sample-ir.json --out ./dist
```

## Packages

| Package | Description |
|---------|-------------|
| `@mkatogui/ule-core` | IR type system, tree traversal/query/transform, token resolver (CSS/Swift/Compose), validation |
| `@mkatogui/ule-figma-connector` | Figma REST client, MCP client wrapper, Code Connect mapper, layout parser |
| `@mkatogui/ule-renderers` | Platform renderers — React+BEM, SwiftUI, Jetpack Compose, Desktop |
| `@mkatogui/ule-cli` | CLI with 9 commands: init, generate, render, sync-tokens, validate, export-ir, map-components, preview, diff |
| `@mkatogui/ule-mcp` | MCP Server with tools (extract-layout, generate-code, sync-tokens, validate-layout) and resources |

## Design Token System

ULE integrates with **UDS v0.6.2** — 600+ W3C DTCG tokens across 7 categories:

- **Spacing**: 4px grid (`$space-1` through `$space-24`)
- **Colors**: Semantic tier with light/dark support (`$color-brand`, `$color-bg-primary`, etc.)
- **Typography**: Size, weight, line-height scales
- **Layout**: Container constraints with `clamp()` fluid values
- **Motion**: Duration and easing curves
- **Z-Index**: Layering system from dropdown to system level
- **Opacity**: Disabled, muted, subtle states

Tokens resolve per platform:
- **Web/Desktop** → CSS custom properties (`--space-4: 16px`)
- **iOS** → Swift constants (`CGFloat(16)`)
- **Android** → Compose values (`16.dp`)

## CLI Commands

```bash
ule init                    # Create ule.config.json and output directories
ule generate                # Full pipeline: Figma → IR → validate → render → write
ule render                  # Render IR JSON to code (no Figma required)
ule sync-tokens             # Export tokens to CSS/Swift/Compose/JSON
ule validate --ir <path>     # Validate an IR document
ule export-ir               # Export Figma frames as IR JSON
ule map-components          # Manage Figma ↔ UDS component mappings
ule preview --ir <path>     # Start local dev server for rendered output
ule diff <a> <b>            # Compare two IR snapshots
```

## Without Figma

You can use ULE without Figma by writing IR JSON directly. See `examples/` for a sample:

```bash
npx ule render --ir examples/sample-ir.json --out ./dist
npx ule validate --ir examples/sample-ir.json
```

The IR format is a JSON tree of layout nodes (Frame, Stack, Grid, Text, etc.) with `$`-prefixed token references. See `examples/README.md` and `schemas/ir.schema.json` for the full structure.

## MCP Server

Add to your Claude configuration:

```json
{
  "mcpServers": {
    "ule": {
      "command": "npx",
      "args": ["@mkatogui/ule-mcp"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}
```

Available tools: `ule_extract_layout`, `ule_generate_code`, `ule_sync_tokens`, `ule_validate_layout`

## Tech Stack

- **Runtime**: Node.js 20+ / TypeScript 5.5+
- **Build**: Turborepo + tsup
- **Lint/Format**: Biome
- **Test**: Vitest
- **UDS**: @mkatogui/universal-design-system v0.6.2

## License

MIT © Marcelo Katogui
