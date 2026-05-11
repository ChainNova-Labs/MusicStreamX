import express from 'express';
import request from 'supertest';
import { artistRoutes } from '../routes/artists';

const app = express();
app.use(express.json());
app.use('/api/v1/artists', artistRoutes);

const ARTIST_ID = '3f08afa9-a277-4400-97f0-625307980c0c';

describe('GET /api/v1/artists/:id/analytics', () => {
  it('returns 200 with analytics data for a valid UUID', async () => {
    const res = await request(app).get(`/api/v1/artists/${ARTIST_ID}/analytics`);
    expect(res.status).toBe(200);
    expect(res.body.artistId).toBe(ARTIST_ID);
    expect(typeof res.body.totalStreams).toBe('number');
    expect(typeof res.body.totalEarnings).toBe('number');
  });

  it('returns streamHistory with 30 entries', async () => {
    const res = await request(app).get(`/api/v1/artists/${ARTIST_ID}/analytics`);
    expect(Array.isArray(res.body.streamHistory)).toBe(true);
    expect(res.body.streamHistory).toHaveLength(30);
    expect(res.body.streamHistory[0]).toHaveProperty('date');
    expect(res.body.streamHistory[0]).toHaveProperty('streams');
  });

  it('returns earningsHistory with 30 entries', async () => {
    const res = await request(app).get(`/api/v1/artists/${ARTIST_ID}/analytics`);
    expect(res.body.earningsHistory).toHaveLength(30);
    expect(res.body.earningsHistory[0]).toHaveProperty('date');
    expect(res.body.earningsHistory[0]).toHaveProperty('earnings');
  });

  it('returns topTracks array', async () => {
    const res = await request(app).get(`/api/v1/artists/${ARTIST_ID}/analytics`);
    expect(Array.isArray(res.body.topTracks)).toBe(true);
    expect(res.body.topTracks.length).toBeGreaterThan(0);
    const track = res.body.topTracks[0];
    expect(track).toHaveProperty('id');
    expect(track).toHaveProperty('title');
    expect(track).toHaveProperty('streams');
    expect(track).toHaveProperty('earnings');
  });

  it('returns geoDistribution array', async () => {
    const res = await request(app).get(`/api/v1/artists/${ARTIST_ID}/analytics`);
    expect(Array.isArray(res.body.geoDistribution)).toBe(true);
    expect(res.body.geoDistribution.length).toBeGreaterThan(0);
    const entry = res.body.geoDistribution[0];
    expect(entry).toHaveProperty('country');
    expect(entry).toHaveProperty('listeners');
    expect(entry).toHaveProperty('percentage');
  });

  it('totalStreams equals sum of streamHistory', async () => {
    const res = await request(app).get(`/api/v1/artists/${ARTIST_ID}/analytics`);
    const history = res.body.streamHistory as Array<{ streams: number }>;
    const sum = history.reduce((s, p) => s + p.streams, 0);
    expect(res.body.totalStreams).toBe(sum);
  });

  it('returns 422 for non-UUID id', async () => {
    const res = await request(app).get('/api/v1/artists/not-a-uuid/analytics');
    expect(res.status).toBe(422);
  });
});
