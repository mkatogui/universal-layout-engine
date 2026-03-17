# ULE Examples

## Using ULE Without Figma

You can use the Universal Layout Engine without Figma by writing IR (Intermediate Representation) JSON directly.

### Quick Start

```bash
# From the monorepo root
npx turbo build

# Render the sample IR to web
npx ule render --ir examples/sample-ir.json --out ./dist

# Validate your IR
npx ule validate --ir examples/sample-ir.json
```

### Sample IR

`sample-ir.json` is a minimal example with:

- **FrameNode** — Root container
- **StackNode** — Flex layout (row/column)
- **TextNode** — Text content with token styling

### IR Structure

```json
{
  "version": "1.0.0",
  "meta": {
    "name": "My Page",
    "generatedAt": "2025-03-17T00:00:00.000Z",
    "generatedBy": "manual"
  },
  "frames": [
    {
      "id": "frame-1",
      "type": "FrameNode",
      "children": [
        {
          "id": "stack-1",
          "type": "StackNode",
          "direction": "column",
          "gap": "$space-6",
          "children": [
            {
              "id": "text-1",
              "type": "TextNode",
              "content": "Hello World",
              "color": "$color-text-primary"
            }
          ]
        }
      ]
    }
  ]
}
```

### Node Types

| Type | Description |
|------|-------------|
| FrameNode | Root container for a screen |
| StackNode | Flex layout (direction, gap, align) |
| GridNode | CSS Grid layout |
| ScrollNode | Scrollable container |
| TextNode | Text with typography tokens |
| ImageNode | Image with src/alt |
| ComponentNode | UDS component reference |
| SpacerNode | Flexible space |
| ConditionalNode | Platform/breakpoint conditions |
| SlotNode | Named content placeholder |

### Token References

Use `$`-prefixed tokens from UDS:

- **Spacing**: `$space-4`, `$space-6`, `$space-8`
- **Colors**: `$color-brand`, `$color-bg-surface`, `$color-text-primary`
- **Typography**: `$font-size-md`, `$font-weight-bold`, `$line-height-normal`

See `@mkatogui/universal-design-system` for the full token set.
