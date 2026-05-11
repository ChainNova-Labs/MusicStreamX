import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate';

export const nftRoutes = Router();

// In-memory store for demo (replace with DB in production)
interface NFTListing {
  id: string;
  trackId: string;
  artistId: string;
  ownerId: string;
  edition: number;
  price: number;
  royaltyPercent: number;
  listed: boolean;
  createdAt: string;
}

const listings: Map<string, NFTListing> = new Map();

// GET /api/v1/nft
nftRoutes.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('listed').optional().isBoolean(),
  ]),
  (_req: Request, res: Response) => {
    res.json({ nfts: [] });
  }
);

// GET /api/v1/nft/:id
nftRoutes.get(
  '/:id',
  validate([param('id').isUUID().withMessage('id must be a valid UUID')]),
  (req: Request, res: Response) => {
    const nft = listings.get(req.params.id);
    if (!nft) {
      res.status(404).json({ error: 'NFT not found' });
      return;
    }
    res.json(nft);
  }
);

// POST /api/v1/nft - mint NFT
nftRoutes.post(
  '/',
  validate([
    body('id').isUUID().withMessage('id must be a valid UUID'),
    body('trackId').isUUID().withMessage('trackId must be a valid UUID'),
    body('artistId').isUUID().withMessage('artistId must be a valid UUID'),
    body('edition').isInt({ min: 1 }).withMessage('edition must be a positive integer'),
    body('price').isFloat({ min: 0 }).withMessage('price must be a non-negative number'),
    body('royaltyPercent')
      .isFloat({ min: 0, max: 100 })
      .withMessage('royaltyPercent must be 0-100'),
  ]),
  (req: Request, res: Response) => {
    const { id, trackId, artistId, edition, price, royaltyPercent } = req.body;
    const nft: NFTListing = {
      id,
      trackId,
      artistId,
      ownerId: artistId,
      edition,
      price,
      royaltyPercent,
      listed: false,
      createdAt: new Date().toISOString(),
    };
    listings.set(id, nft);
    res.status(201).json({ message: 'NFT minted', data: nft });
  }
);

// PUT /api/v1/nft/:id/price - update listing price
nftRoutes.put(
  '/:id/price',
  validate([
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('price').isFloat({ min: 0 }).withMessage('price must be a non-negative number'),
  ]),
  (req: Request, res: Response) => {
    const nft = listings.get(req.params.id);
    if (!nft) {
      res.status(404).json({ error: 'NFT not found' });
      return;
    }
    nft.price = req.body.price;
    listings.set(nft.id, nft);
    res.json({ message: 'Price updated', id: req.params.id, price: nft.price });
  }
);

// POST /api/v1/nft/:id/list - list NFT for sale
nftRoutes.post(
  '/:id/list',
  validate([
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('price').isFloat({ min: 0 }).withMessage('price must be a non-negative number'),
    body('sellerId').isUUID().withMessage('sellerId must be a valid UUID'),
  ]),
  (req: Request, res: Response) => {
    const nft = listings.get(req.params.id);
    if (!nft) {
      res.status(404).json({ error: 'NFT not found' });
      return;
    }
    if (nft.ownerId !== req.body.sellerId) {
      res.status(403).json({ error: 'Only the owner can list this NFT' });
      return;
    }
    nft.price = req.body.price;
    nft.listed = true;
    listings.set(nft.id, nft);
    res.json({ message: 'NFT listed for sale', data: nft });
  }
);

// POST /api/v1/nft/:id/delist - remove NFT from sale
nftRoutes.post(
  '/:id/delist',
  validate([
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('sellerId').isUUID().withMessage('sellerId must be a valid UUID'),
  ]),
  (req: Request, res: Response) => {
    const nft = listings.get(req.params.id);
    if (!nft) {
      res.status(404).json({ error: 'NFT not found' });
      return;
    }
    if (nft.ownerId !== req.body.sellerId) {
      res.status(403).json({ error: 'Only the owner can delist this NFT' });
      return;
    }
    nft.listed = false;
    listings.set(nft.id, nft);
    res.json({ message: 'NFT delisted', data: nft });
  }
);

/**
 * Calculates royalty distribution for a secondary sale.
 * Returns amounts for: seller, artist (royalty), platform fee.
 */
export function calculateRoyalties(
  salePrice: number,
  royaltyPercent: number,
  platformFeePercent = 2.5
): { sellerAmount: number; royaltyAmount: number; platformFee: number } {
  const royaltyAmount = (salePrice * royaltyPercent) / 100;
  const platformFee = (salePrice * platformFeePercent) / 100;
  const sellerAmount = salePrice - royaltyAmount - platformFee;
  return { sellerAmount, royaltyAmount, platformFee };
}

// POST /api/v1/nft/:id/buy - purchase a listed NFT
nftRoutes.post(
  '/:id/buy',
  validate([
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('buyerId').isUUID().withMessage('buyerId must be a valid UUID'),
  ]),
  (req: Request, res: Response) => {
    const nft = listings.get(req.params.id);
    if (!nft) {
      res.status(404).json({ error: 'NFT not found' });
      return;
    }
    if (!nft.listed) {
      res.status(400).json({ error: 'NFT is not listed for sale' });
      return;
    }
    if (nft.ownerId === req.body.buyerId) {
      res.status(400).json({ error: 'Owner cannot buy their own NFT' });
      return;
    }

    const isSecondarySale = nft.ownerId !== nft.artistId;
    const distribution = isSecondarySale
      ? calculateRoyalties(nft.price, nft.royaltyPercent)
      : { sellerAmount: nft.price * 0.975, royaltyAmount: 0, platformFee: nft.price * 0.025 };

    const previousOwner = nft.ownerId;
    nft.ownerId = req.body.buyerId;
    nft.listed = false;
    listings.set(nft.id, nft);

    res.json({
      message: 'NFT purchased successfully',
      nft,
      transaction: {
        salePrice: nft.price,
        previousOwner,
        newOwner: req.body.buyerId,
        artistId: nft.artistId,
        isSecondarySale,
        distribution,
      },
    });
  }
);
