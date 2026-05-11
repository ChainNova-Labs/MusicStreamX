import express from 'express';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { musicRoutes, registerTrackOnChain } from '../routes/music';
import { ipfsService } from '../services/ipfsService';

jest.mock('../services/ipfsService', () => ({
  ipfsService: {
    uploadFile: jest.fn(),
    getGatewayUrl: jest.fn((cid) => `https://ipfs.io/ipfs/${cid}`),
  },
}));

const mockUploadFile = ipfsService.uploadFile as jest.Mock;

const app = express();
app.use(express.json());
app.use('/api/v1/music', musicRoutes);

function makeTempAudio(): string {
  const tmp = path.join(os.tmpdir(), `test-${Date.now()}.mp3`);
  fs.writeFileSync(tmp, Buffer.from('fake-audio-data'));
  return tmp;
}

describe('POST /api/v1/music/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUploadFile.mockResolvedValue('QmTestHash1234567890123456789012345678901234567');
  });

  it('returns 400 when no file is attached', async () => {
    const res = await request(app)
      .post('/api/v1/music/upload')
      .field('title', 'My Track')
      .field('artist', 'Artist')
      .field('genre', 'pop')
      .field('duration', '180')
      .field('artistAddress', 'GXXX');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/No audio file/i);
  });

  it('returns 400 when required fields are missing', async () => {
    const tmp = makeTempAudio();
    const res = await request(app)
      .post('/api/v1/music/upload')
      .attach('audio', tmp, { contentType: 'audio/mpeg' })
      .field('title', 'My Track');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/i);
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  });

  it('returns 400 for invalid duration', async () => {
    const tmp = makeTempAudio();
    const res = await request(app)
      .post('/api/v1/music/upload')
      .attach('audio', tmp, { contentType: 'audio/mpeg' })
      .field('title', 'My Track')
      .field('artist', 'Artist')
      .field('genre', 'pop')
      .field('duration', '0')
      .field('artistAddress', 'GXXX');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/duration/i);
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  });

  it('returns 400 for non-audio file type', async () => {
    const tmp = path.join(os.tmpdir(), `test-${Date.now()}.txt`);
    fs.writeFileSync(tmp, 'not audio');
    const res = await request(app)
      .post('/api/v1/music/upload')
      .attach('audio', tmp, { contentType: 'text/plain' })
      .field('title', 'My Track')
      .field('artist', 'Artist')
      .field('genre', 'pop')
      .field('duration', '180')
      .field('artistAddress', 'GXXX');
    expect(res.status).toBe(400);
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  });

  it('uploads file to IPFS and registers on-chain, returns 201', async () => {
    const tmp = makeTempAudio();
    const res = await request(app)
      .post('/api/v1/music/upload')
      .attach('audio', tmp, { contentType: 'audio/mpeg' })
      .field('title', 'My Track')
      .field('artist', 'Cool Artist')
      .field('genre', 'pop')
      .field('duration', '180')
      .field('artistAddress', 'GXXX');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ipfsHash).toBe('QmTestHash1234567890123456789012345678901234567');
    expect(res.body.data.ipfsUrl).toContain('ipfs.io/ipfs');
    expect(res.body.data.txHash).toBeTruthy();
    expect(res.body.data.title).toBe('My Track');
    expect(mockUploadFile).toHaveBeenCalledTimes(1);
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  });

  it('returns 500 when IPFS upload fails', async () => {
    mockUploadFile.mockRejectedValue(new Error('IPFS unavailable'));
    const tmp = makeTempAudio();
    const res = await request(app)
      .post('/api/v1/music/upload')
      .attach('audio', tmp, { contentType: 'audio/mpeg' })
      .field('title', 'My Track')
      .field('artist', 'Artist')
      .field('genre', 'pop')
      .field('duration', '180')
      .field('artistAddress', 'GXXX');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/upload failed/i);
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  });
});

describe('registerTrackOnChain', () => {
  it('returns a transaction hash string', async () => {
    const txHash = await registerTrackOnChain({
      ipfsHash: 'QmTestHash1234567890123456789012345678901234567',
      title: 'Test',
      artist: 'Artist',
      genre: 'pop',
      duration: 180,
      artistAddress: 'GXXX',
    });
    expect(typeof txHash).toBe('string');
    expect(txHash).toMatch(/^tx_/);
  });
});

describe('GET /api/v1/music', () => {
  it('returns 200 with empty data array', async () => {
    const res = await request(app).get('/api/v1/music');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('GET /api/v1/music/:id', () => {
  it('returns 200 with the id', async () => {
    const res = await request(app).get('/api/v1/music/abc123');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('abc123');
  });
});
