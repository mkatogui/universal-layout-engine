import type {
  FigmaFile,
  FigmaNode,
  FigmaImageResponse,
  FigmaVariablesResponse,
} from './types.js';

/**
 * Figma REST API client
 *
 * @example
 * ```ts
 * const client = new FigmaRestClient('fileKey123', 'figd_...');
 * const file = await client.getFile();
 * const node = await client.getNode('123:456');
 * ```
 */
export class FigmaRestClient {
  private readonly baseUrl = 'https://api.figma.com/v1';
  private readonly fileKey: string;
  private readonly accessToken: string;

  /**
   * Creates a new Figma REST API client
   * @param fileKey Figma file key
   * @param accessToken Figma personal access token
   */
  constructor(fileKey: string, accessToken: string) {
    if (!fileKey) throw new Error('fileKey is required');
    if (!accessToken) throw new Error('accessToken is required');

    this.fileKey = fileKey;
    this.accessToken = accessToken;
  }

  /**
   * Get the full file object
   */
  async getFile(): Promise<FigmaFile> {
    return this.request<FigmaFile>(`/files/${this.fileKey}`);
  }

  /**
   * Get a specific node by ID
   * @param nodeId Figma node ID (e.g., "123:456")
   */
  async getNode(nodeId: string): Promise<FigmaNode> {
    const data = await this.request<{ nodes: Record<string, { document: FigmaNode }> }>(
      `/files/${this.fileKey}/nodes`,
      {
        ids: nodeId,
      },
    );

    const nodeData = data.nodes[nodeId];
    if (!nodeData) {
      throw new Error(`Node ${nodeId} not found`);
    }

    return nodeData.document;
  }

  /**
   * Get multiple nodes by IDs
   * @param nodeIds Array of Figma node IDs
   */
  async getNodes(nodeIds: string[]): Promise<Map<string, FigmaNode>> {
    if (nodeIds.length === 0) {
      return new Map();
    }

    const data = await this.request<{ nodes: Record<string, { document: FigmaNode }> }>(
      `/files/${this.fileKey}/nodes`,
      {
        ids: nodeIds.join(','),
      },
    );

    const result = new Map<string, FigmaNode>();
    for (const [nodeId, nodeData] of Object.entries(data.nodes)) {
      if (nodeData?.document) {
        result.set(nodeId, nodeData.document);
      }
    }

    return result;
  }

  /**
   * Get rendered images for nodes
   * @param nodeIds Array of node IDs to render
   * @param format Image format (default: 'png')
   * @param scale Scale factor (default: 1)
   */
  async getImages(
    nodeIds: string[],
    format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png',
    scale: number = 1,
  ): Promise<Record<string, string | null>> {
    const data = await this.request<FigmaImageResponse>(`/files/${this.fileKey}/images`, {
      ids: nodeIds.join(','),
      format,
      scale,
    });

    if (data.err) {
      throw new Error(`Failed to get images: ${data.err}`);
    }

    return data.images;
  }

  /**
   * Get file variables and variable collections
   */
  async getVariables(): Promise<FigmaVariablesResponse> {
    return this.request<FigmaVariablesResponse>(`/files/${this.fileKey}/variables/local`);
  }

  /**
   * Get shared library components
   */
  async getComponents(): Promise<Record<string, any>> {
    const file = await this.getFile();
    return file.components || {};
  }

  /**
   * Get shared library styles
   */
  async getStyles(): Promise<Record<string, any>> {
    const file = await this.getFile();
    return file.styles || {};
  }

  /**
   * Make an HTTP request to Figma API
   * @param endpoint API endpoint path
   * @param params Query parameters
   * @private
   */
  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-Figma-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Figma API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }
}
