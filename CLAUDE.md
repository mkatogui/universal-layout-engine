# Universal Layout Engine — Project Standards

## Build & Test
- `npx turbo build` — Build all packages
- `npx turbo test` — Run all tests with Vitest
- `npx turbo typecheck` — TypeScript type checking
- `npx biome check .` — Lint and format check
- `npx biome format --write .` — Auto-format

## Code Style
- Use ES modules (import/export), never CommonJS (require)
- Single quotes, 2-space indent, 100 char line width (Biome enforced)
- Use `type` imports for type-only imports: `import type { Foo } from './bar.js'`
- Always include `.js` extension in relative imports (ESM requirement)
- Prefer `interface` over `type` for object shapes
- Use discriminated unions with `type` field for node variants

## Architecture
- **One IR format**: All packages use `@mkatogui/ule-core` types. Never define duplicate IR node types.
- Node type discriminators are PascalCase: `'StackNode'`, `'FrameNode'`, `'GridNode'`, etc.
- Token references use `$` prefix without extra hyphen: `$color-brand`, `$space-4` (not `$-color-brand`)
- All token values come from `@mkatogui/ule-core/resolver`, not hardcoded per renderer
- Cross-package deps must be declared in each package.json: e.g. renderers depends on core

## IR Rules
- `IRDocument` has `frames: FrameNode[]` at the root (not `root`)
- Every node has `id: string` and `type: NodeType`
- Renderers must handle all 10 node types from `LayoutNode` union

## Testing
- Write tests alongside code in `__tests__/` or `*.test.ts` files
- Run single test files during dev: `npx vitest run packages/core/src/__tests__/resolver.test.ts`
- Always run `npx turbo typecheck` after making changes across packages

## Workflow
- Typecheck when done making code changes
- Prefer running single tests, not the whole suite, for performance
- Use `git diff` to verify changes before committing
