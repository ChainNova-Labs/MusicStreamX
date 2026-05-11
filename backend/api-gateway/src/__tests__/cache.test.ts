import express from 'express';
import request from 'supertest';

// Mock Redis client before importing routes
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockDel = jest.fn();

jest.mock('../config/redis', () => ({
  getRedisClient: () => ({
    get: mockGet,
    set: mockSet,
    del: mockDel,
  }),
}));

import { musicRoutes } from '../routes/music';
import { artistRoutes } from '../routes/artists';
import { cacheGet, cacheSet, cacheDel } from '../services/cacheService';

const app = express();
app.use(express.json());
app.use('/api/v1/music', musicRoutes);
app.use('/api/v1/artists', artistRoutes);

const ARTIST_ID = '3f08afa9-a277-4400-97f0-625307980c0c';

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue(null); // default: cache miss
  mockSet.mockResolvedValue('OK');
  mockDel.mockResolvedValue(1);
});

// ── cacheService unit tests ──────────────────────────────────────────────────

describe('cacheService', () => {
  describe('cacheGet', () => {
    it('returns parsed value on cache hit', async () => {
      mockGet.mockResolvedValue(JSON.stringify({ foo: 'bar' }));
      const result = await cacheGet<{ foo: string }>('key');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('returns null on cache miss', async () => {
      mockGet.mockResolvedValue(null);
      expect(await cacheGet('key')).toBeNull();
    });

    it('returns null when Redis throws', async () => {
      mockGet.mockRejectedValue(new Error('Redis down'));
      expect(await cacheGet('key')).toBeNull();
    });
  });

  describe('cacheSet', () => {
    it('calls redis.set with JSON and TTL', async () => {
      await cacheSet('key', { a: 1 }, 60);
      expect(mockSet).toHaveBeenCalledWith('key', JSON.stringify({ a: 1 }), { EX: 60 });
    });

    it('does not throw when Redis throws', async () => {
      mockSet.mockRejectedValue(new Error('Redis down'));
      await expect(cacheSet('key', {}, 60)).resolves.toBeUndefined();
    });
  });

  describe('cacheDel', () => {
    it('calls redis.del with the key', async () => {
      await cacheDel('key');
      expect(mockDel).toHaveBeenCalledWith('key');
    });

    it('does not throw when Redis throws', async () => {
      mockDel.mockRejectedValue(new Error('Redis down'));
      await expect(cacheDel('key')).resolves.toBeUndefined();
    });
  });
});

// ── Music route caching ──────────────────────────────────────────────────────

describe('GET /api/v1/music (top tracks)', () => {
  it('returns MISS header and caches on first request', async () => {
    const res = await request(app).get('/api/v1/music');
    expect(res.status).toBe(200);
    expect(res.headers['x-cache']).toBe('MISS');
    expect(mockSet).toHaveBeenCalledWith('top_tracks', expect.any(String), { EX: 300 });
  });

  it('returns HIT header and skips DB on cache hit', async () => {
    mockGet.mockResolvedValue(JSON.stringify({ success: true, data: [] }));
    const res = await request(app).get('/api/v1/music');
    expect(res.headers['x-cache']).toBe('HIT');
    expect(mockSet).not.toHaveBeenCalled();
  });
});

describe('GET /api/v1/music/:id (single track)', () => {
  it('caches individual track on MISS', async () => {
    const res = await request(app).get('/api/v1/music/abc123');
    expect(res.status).toBe(200);
    expect(res.headers['x-cache']).toBe('MISS');
    expect(mockSet).toHaveBeenCalledWith('track:abc123', expect.any(String), { EX: 300 });
  });

  it('returns HIT on cache hit', async () => {
    mockGet.mockResolvedValue(JSON.stringify({ success: true, data: { id: 'abc123' } }));
    const res = await request(app).get('/api/v1/music/abc123');
    expect(res.headers['x-cache']).toBe('HIT');
  });
});

describe('POST /api/v1/music (invalidates cache)', () => {
  it('deletes top_tracks cache on new track creation', async () => {
    const res = await request(app).post('/api/v1/music').send({
      title: 'Test Track',
      artist: 'Artist',
      genre: 'pop',
      duration: 180,
      ipfs_hash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    });
    expect(res.status).toBe(201);
    expect(mockDel).toHaveBeenCalledWith('top_tracks');
  });
});

// ── Artist profile caching ───────────────────────────────────────────────────

describe('GET /api/v1/artists/:id (artist profile)', () => {
  it('caches artist profile on MISS', async () => {
    const res = await request(app).get(`/api/v1/artists/${ARTIST_ID}`);
    expect(res.status).toBe(200);
    expect(res.headers['x-cache']).toBe('MISS');
    expect(mockSet).toHaveBeenCalledWith(
      `artist_profile:${ARTIST_ID}`,
      expect.any(String),
      { EX: 600 }
    );
  });

  it('returns HIT on cache hit', async () => {
    mockGet.mockResolvedValue(JSON.stringify({ id: ARTIST_ID }));
    const res = await request(app).get(`/api/v1/artists/${ARTIST_ID}`);
    expect(res.headers['x-cache']).toBe('HIT');
    expect(mockSet).not.toHaveBeenCalled();
  });
});

describe('PUT /api/v1/artists/:id (invalidates cache)', () => {
  it('deletes artist profile cache on update', async () => {
    const res = await request(app)
      .put(`/api/v1/artists/${ARTIST_ID}`)
      .send({ name: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(mockDel).toHaveBeenCalledWith(`artist_profile:${ARTIST_ID}`);
  });
});

// ── Artist analytics caching ─────────────────────────────────────────────────

describe('GET /api/v1/artists/:id/analytics (analytics)', () => {
  it('caches analytics on MISS', async () => {
    const res = await request(app).get(`/api/v1/artists/${ARTIST_ID}/analytics`);
    expect(res.status).toBe(200);
    expect(res.headers['x-cache']).toBe('MISS');
    expect(mockSet).toHaveBeenCalledWith(
      `artist_analytics:${ARTIST_ID}`,
      expect.any(String),
      { EX: 600 }
    );
  });

  it('returns HIT on cache hit', async () => {
    mockGet.mockResolvedValue(JSON.stringify({ artistId: ARTIST_ID, totalStreams: 100 }));
    const res = await request(app).get(`/api/v1/artists/${ARTIST_ID}/analytics`);
    expect(res.headers['x-cache']).toBe('HIT');
    expect(mockSet).not.toHaveBeenCalled();
  });
});
