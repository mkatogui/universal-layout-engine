import {
  Server,
  StdioServerTransport,
  Tool,
  TextContent,
  Resource,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequest, ListResourcesRequest, ReadResourceRequest } from '@modelcontextprotocol/sdk/types.js';

import { extractLayoutTool } from './tools/extract-layout.js';
import { generateCodeTool } from './tools/generate-code.js';
import { syncTokensTool } from './tools/sync-tokens.js';
import { validateLayoutTool } from './tools/validate-layout.js';

import { tokensResource } from './resources/tokens.js';
import { componentsResource } from './resources/components.js';

/**
 * Universal Layout Engine MCP Server
 *
 * Provides tools and resources for Claude to interact with the ULE system:
 *
 * Tools:
 * - ule_extract_layout: Extract design data from Figma and generate IR
 * - ule_generate_code: Generate platform code from IR
 * - ule_sync_tokens: Generate token files in multiple formats
 * - ule_validate_layout: Validate IR against UDS rules
 *
 * Resources:
 * - ule://tokens: UDS token definitions and values
 * - ule://components: UDS component library with variants
 */
class UniversalLayoutEngineServer {
  private server: Server;
  private tools: Map<string, Tool> = new Map();
  private resources: Map<string, Resource | ResourceTemplate> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'ule-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupTools();
    this.setupResources();
    this.setupHandlers();
  }

  /**
   * Register all available tools
   */
  private setupTools(): void {
    const tools = [
      extractLayoutTool,
      generateCodeTool,
      syncTokensTool,
      validateLayoutTool,
    ];

    for (const tool of tools) {
      this.tools.set(tool.name, tool);
    }
  }

  /**
   * Register all available resources
   */
  private setupResources(): void {
    this.resources.set('ule://tokens', tokensResource);
    this.resources.set('ule://components', componentsResource);
  }

  /**
   * Setup MCP protocol handlers
   */
  private setupHandlers(): void {
    // List tools
    this.server.setRequestHandler(ListResourcesRequest, async () => {
      return {
        resources: Array.from(this.resources.values()),
      };
    });

    // Read resource
    this.server.setRequestHandler(ReadResourceRequest, async (request) => {
      const resource = this.resources.get(request.params.uri);

      if (!resource) {
        throw new Error(`Unknown resource: ${request.params.uri}`);
      }

      // Handle template resources (tokens, components)
      if (request.params.uri === 'ule://tokens') {
        const tokenContent = await tokensResource.getContent();
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'application/json',
              text: tokenContent,
            } as TextContent,
          ],
        };
      }

      if (request.params.uri === 'ule://components') {
        const componentContent = await componentsResource.getContent();
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'application/json',
              text: componentContent,
            } as TextContent,
          ],
        };
      }

      throw new Error(`Unable to read resource: ${request.params.uri}`);
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequest, async (request) => {
      const tool = this.tools.get(request.params.name);

      if (!tool) {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      try {
        // Validate input against schema
        if (tool.inputSchema) {
          // TODO: Validate request.params.arguments against tool.inputSchema
        }

        // Execute tool
        const result = await this.executeTool(request.params.name, request.params.arguments as Record<string, unknown>);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool: ${errorMessage}`,
              isError: true,
            },
          ],
        };
      }
    });
  }

  /**
   * Execute a tool with the given arguments
   */
  private async executeTool(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    switch (toolName) {
      case 'ule_extract_layout': {
        const figmaUrl = args.figmaUrl as string;
        const frameName = args.frameName as string | undefined;
        return extractLayoutTool.handler({ figmaUrl, frameName });
      }

      case 'ule_generate_code': {
        const ir = args.ir as string;
        const platforms = args.platforms as string[];
        const palette = args.palette as string | undefined;
        return generateCodeTool.handler({ ir, platforms, palette });
      }

      case 'ule_sync_tokens': {
        const formats = args.formats as string[];
        const palette = args.palette as string | undefined;
        return syncTokensTool.handler({ formats, palette });
      }

      case 'ule_validate_layout': {
        const ir = args.ir as string;
        const rules = args.rules as string[];
        return validateLayoutTool.handler({ ir, rules });
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * Start the MCP server with stdio transport
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ULE MCP Server running on stdio');
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const server = new UniversalLayoutEngineServer();
  await server.run();
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
