import express from 'express';
import request from 'supertest';
import { nftRoutes, calculateRoyalties } from '../routes/nft';

const app = express();
app.use(express.json());
app.use('/api/v1/nft', nftRoutes);

// Valid v4 UUIDs
const ARTIST_ID = '3f08afa9-a277-4400-97f0-625307980c0c';
const BUYER_ID  = 'a32d7d2e-7cbb-4d10-a3a3-6e3e8ae99162';
const NFT_ID    = '6fa5be20-f839-4fc9-b4f3-c45281a961ff';
const TRACK_ID  = '992082bc-0fdb-45db-a3ab-862752f0e22f';
const UNKNOWN_ID = '11111111-1111-4111-a111-111111111111';

async function mintNFT(overrides: Record<string, unknown> = {}) {
  return request(app)
    .post('/api/v1/nft')
    .send({
      id: NFT_ID,
      trackId: TRACK_ID,
      artistId: ARTIST_ID,
      edition: 1,
      price: 100,
      royaltyPercent: 10,
      ...overrides,
    });
}

describe('NFT Routes', () => {
  describe('GET /api/v1/nft', () => {
    it('returns 200 with nfts array', async () => {
      const res = await request(app).get('/api/v1/nft');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.nfts)).toBe(true);
    });

    it('rejects invalid page param', async () => {
      const res = await request(app).get('/api/v1/nft?page=abc');
      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/nft (mint)', () => {
    it('mints an NFT and returns 201', async () => {
      const res = await mintNFT();
      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe(NFT_ID);
      expect(res.body.data.listed).toBe(false);
    });

    it('rejects missing trackId', async () => {
      const res = await request(app)
        .post('/api/v1/nft')
        .send({ id: NFT_ID, artistId: ARTIST_ID, edition: 1, price: 10, royaltyPercent: 5 });
      expect(res.status).toBe(422);
    });

    it('rejects royaltyPercent > 100', async () => {
      const res = await mintNFT({ royaltyPercent: 150 });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/nft/:id', () => {
    it('returns the NFT by id', async () => {
      const res = await request(app).get(`/api/v1/nft/${NFT_ID}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(NFT_ID);
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).get(`/api/v1/nft/${UNKNOWN_ID}`);
      expect(res.status).toBe(404);
    });

    it('returns 422 for non-UUID id', async () => {
      const res = await request(app).get('/api/v1/nft/not-a-uuid');
      expect(res.status).toBe(422);
    });
  });

  describe('PUT /api/v1/nft/:id/price', () => {
    it('updates the price', async () => {
      const res = await request(app)
        .put(`/api/v1/nft/${NFT_ID}/price`)
        .send({ price: 200 });
      expect(res.status).toBe(200);
      expect(res.body.price).toBe(200);
    });

    it('returns 404 for unknown NFT', async () => {
      const res = await request(app)
        .put(`/api/v1/nft/${UNKNOWN_ID}/price`)
        .send({ price: 50 });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/nft/:id/list', () => {
    it('lists the NFT for sale', async () => {
      const res = await request(app)
        .post(`/api/v1/nft/${NFT_ID}/list`)
        .send({ price: 150, sellerId: ARTIST_ID });
      expect(res.status).toBe(200);
      expect(res.body.data.listed).toBe(true);
      expect(res.body.data.price).toBe(150);
    });

    it('rejects non-owner listing', async () => {
      const res = await request(app)
        .post(`/api/v1/nft/${NFT_ID}/list`)
        .send({ price: 150, sellerId: BUYER_ID });
      expect(res.status).toBe(403);
    });

    it('returns 404 for unknown NFT', async () => {
      const res = await request(app)
        .post(`/api/v1/nft/${UNKNOWN_ID}/list`)
        .send({ price: 10, sellerId: ARTIST_ID });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/nft/:id/buy', () => {
    it('allows buyer to purchase a listed NFT', async () => {
      const res = await request(app)
        .post(`/api/v1/nft/${NFT_ID}/buy`)
        .send({ buyerId: BUYER_ID });
      expect(res.status).toBe(200);
      expect(res.body.nft.ownerId).toBe(BUYER_ID);
      expect(res.body.nft.listed).toBe(false);
    });

    it('returns 400 when NFT is not listed', async () => {
      // NFT was just bought so it's no longer listed
      const res = await request(app)
        .post(`/api/v1/nft/${NFT_ID}/buy`)
        .send({ buyerId: ARTIST_ID });
      expect(res.status).toBe(400);
    });

    it('returns 400 when owner tries to buy own NFT', async () => {
      // Re-list as BUYER_ID (now the owner)
      await request(app)
        .post(`/api/v1/nft/${NFT_ID}/list`)
        .send({ price: 100, sellerId: BUYER_ID });

      const res = await request(app)
        .post(`/api/v1/nft/${NFT_ID}/buy`)
        .send({ buyerId: BUYER_ID });
      expect(res.status).toBe(400);
    });

    it('distributes royalties on secondary sale', async () => {
      // ARTIST_ID buys from BUYER_ID — secondary sale
      const res = await request(app)
        .post(`/api/v1/nft/${NFT_ID}/buy`)
        .send({ buyerId: ARTIST_ID });
      expect(res.status).toBe(200);
      expect(res.body.transaction.isSecondarySale).toBe(true);
      expect(res.body.transaction.distribution.royaltyAmount).toBeGreaterThan(0);
    });

    it('returns 404 for unknown NFT', async () => {
      const res = await request(app)
        .post(`/api/v1/nft/${UNKNOWN_ID}/buy`)
        .send({ buyerId: BUYER_ID });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/nft/:id/delist', () => {
    it('delists an NFT', async () => {
      // ARTIST_ID now owns it; list it first
      await request(app)
        .post(`/api/v1/nft/${NFT_ID}/list`)
        .send({ price: 100, sellerId: ARTIST_ID });

      const res = await request(app)
        .post(`/api/v1/nft/${NFT_ID}/delist`)
        .send({ sellerId: ARTIST_ID });
      expect(res.status).toBe(200);
      expect(res.body.data.listed).toBe(false);
    });

    it('rejects non-owner delist', async () => {
      const res = await request(app)
        .post(`/api/v1/nft/${NFT_ID}/delist`)
        .send({ sellerId: BUYER_ID });
      expect(res.status).toBe(403);
    });
  });

  describe('calculateRoyalties', () => {
    it('correctly splits a sale', () => {
      const result = calculateRoyalties(100, 10);
      expect(result.royaltyAmount).toBe(10);
      expect(result.platformFee).toBe(2.5);
      expect(result.sellerAmount).toBe(87.5);
    });

    it('handles 0% royalty', () => {
      const result = calculateRoyalties(200, 0);
      expect(result.royaltyAmount).toBe(0);
      expect(result.sellerAmount).toBe(195);
    });

    it('supports custom platform fee', () => {
      const result = calculateRoyalties(100, 10, 5);
      expect(result.platformFee).toBe(5);
      expect(result.sellerAmount).toBe(85);
    });
  });
});
