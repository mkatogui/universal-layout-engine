/**
 * Figma Connector Package
 *
 * Provides Figma REST API client, MCP client, layout parser, and Code Connect
 * mapping utilities for the Universal Layout Engine.
 */

// REST API
export { FigmaRestClient } from './rest/client.js';
export type {
  FigmaFile,
  FigmaNode,
  FigmaNodeType,
  FigmaAutoLayout,
  FigmaComponent,
  FigmaVariable,
  FigmaStyle,
  FigmaConstraint,
} from './rest/types.js';

// MCP Client
export { FigmaMcpClient } from './mcp/figma-mcp-client.js';
export type {
  DesignContextResponse,
  DesignMetadata,
  ScreenshotResponse,
  MetadataResponse,
  CodeConnectMapping,
  CodeConnectMapResponse,
  VariableDefinition,
} from './mcp/figma-mcp-client.js';

// Code Connect Mapper
export { CodeConnectMapper } from './code-connect/mapper.js';
export type { CodeConnectData, ComponentSuggestion } from './code-connect/mapper.js';

// Layout Parser (outputs @mkatogui/ule-core IR types)
export { FigmaLayoutParser } from './parser.js';
