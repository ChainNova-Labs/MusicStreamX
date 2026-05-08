import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate';

export const artistRoutes = Router();

// GET /api/v1/artists
artistRoutes.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ]),
  (req: Request, res: Response) => {
    res.json({ artists: [] });
  }
);

// GET /api/v1/artists/:id
artistRoutes.get(
  '/:id',
  validate([param('id').isUUID().withMessage('id must be a valid UUID')]),
  (req: Request, res: Response) => {
    res.json({ id: req.params.id });
  }
);

// POST /api/v1/artists - register artist
artistRoutes.post(
  '/',
  validate([
    body('name').notEmpty().trim().isLength({ max: 100 }).withMessage('name is required (max 100 chars)'),
    body('email').isEmail().normalizeEmail().withMessage('valid email is required'),
    body('walletAddress').notEmpty().trim().withMessage('walletAddress is required'),
    body('bio').optional().trim().isLength({ max: 1000 }),
  ]),
  (req: Request, res: Response) => {
    res.status(201).json({ message: 'Artist registered', data: req.body });
  }
);

// PUT /api/v1/artists/:id
artistRoutes.put(
  '/:id',
  validate([
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('name').optional().trim().isLength({ max: 100 }),
    body('bio').optional().trim().isLength({ max: 1000 }),
  ]),
  (req: Request, res: Response) => {
    res.json({ message: 'Artist updated', id: req.params.id });
  }
);
