import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate';

export const nftRoutes = Router();

// GET /api/v1/nft
nftRoutes.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ]),
  (req: Request, res: Response) => {
    res.json({ nfts: [] });
  }
);

// GET /api/v1/nft/:id
nftRoutes.get(
  '/:id',
  validate([param('id').isUUID().withMessage('id must be a valid UUID')]),
  (req: Request, res: Response) => {
    res.json({ id: req.params.id });
  }
);

// POST /api/v1/nft - mint NFT
nftRoutes.post(
  '/',
  validate([
    body('trackId').isUUID().withMessage('trackId must be a valid UUID'),
    body('artistId').isUUID().withMessage('artistId must be a valid UUID'),
    body('edition').isInt({ min: 1 }).withMessage('edition must be a positive integer'),
    body('price').isFloat({ min: 0 }).withMessage('price must be a non-negative number'),
    body('royaltyPercent').isFloat({ min: 0, max: 100 }).withMessage('royaltyPercent must be 0-100'),
  ]),
  (req: Request, res: Response) => {
    res.status(201).json({ message: 'NFT minted', data: req.body });
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
    res.json({ message: 'Price updated', id: req.params.id });
  }
);
