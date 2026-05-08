import { create, IPFSHTTPClient } from 'ipfs-http-client';
import fs from 'fs';
import { logger } from '../utils/logger';

class IPFSService {
  private client: IPFSHTTPClient | null = null;
  private readonly apiUrl: string;

  constructor() {
    this.apiUrl = process.env.IPFS_API_URL || 'http://localhost:5001';
  }

  async initialize(): Promise<void> {
    try {
      this.client = create({ url: this.apiUrl });
      // Verify connectivity
      await this.client.version();
      logger.info(`IPFS client connected to ${this.apiUrl}`);
    } catch (error) {
      logger.warn(`IPFS node unavailable at ${this.apiUrl}, uploads will fail until connected`);
      this.client = null;
    }
  }

  private ensureConnected(): IPFSHTTPClient {
    if (!this.client) {
      throw new Error('IPFS client is not initialized. Call initialize() first.');
    }
    return this.client;
  }

  async uploadFile(filePath: string): Promise<string> {
    const client = this.ensureConnected();

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const result = await client.add(fileBuffer, { pin: true });
      logger.info(`File uploaded to IPFS: ${result.cid.toString()}`);
      return result.cid.toString();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`IPFS upload failed for ${filePath}: ${message}`);
      throw new Error(`Failed to upload file to IPFS: ${message}`);
    }
  }

  async uploadBuffer(buffer: Buffer, filename?: string): Promise<string> {
    const client = this.ensureConnected();

    try {
      const result = await client.add(buffer, { pin: true });
      logger.info(`Buffer uploaded to IPFS${filename ? ` (${filename})` : ''}: ${result.cid.toString()}`);
      return result.cid.toString();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`IPFS buffer upload failed: ${message}`);
      throw new Error(`Failed to upload buffer to IPFS: ${message}`);
    }
  }

  async uploadJSON(data: object): Promise<string> {
    const client = this.ensureConnected();

    try {
      const json = JSON.stringify(data);
      const result = await client.add(Buffer.from(json), { pin: true });
      logger.info(`JSON uploaded to IPFS: ${result.cid.toString()}`);
      return result.cid.toString();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`IPFS JSON upload failed: ${message}`);
      throw new Error(`Failed to upload JSON to IPFS: ${message}`);
    }
  }

  async getFile(cid: string): Promise<Buffer> {
    const client = this.ensureConnected();

    if (!cid || typeof cid !== 'string') {
      throw new Error('Invalid CID provided');
    }

    try {
      const chunks: Uint8Array[] = [];
      for await (const chunk of client.cat(cid)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`IPFS fetch failed for CID ${cid}: ${message}`);
      throw new Error(`Failed to retrieve file from IPFS: ${message}`);
    }
  }

  async pin(cid: string): Promise<void> {
    const client = this.ensureConnected();

    try {
      await client.pin.add(cid);
      logger.info(`Pinned CID: ${cid}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`IPFS pin failed for CID ${cid}: ${message}`);
      throw new Error(`Failed to pin CID ${cid}: ${message}`);
    }
  }

  getGatewayUrl(cid: string): string {
    const gateway = process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs';
    return `${gateway}/${cid}`;
  }

  isConnected(): boolean {
    return this.client !== null;
  }
}

export const ipfsService = new IPFSService();
