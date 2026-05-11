import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate';

export const fanRoutes = Router();

// GET /api/v1/fans/:id
fanRoutes.get(
  '/:id',
  validate([param('id').isUUID().withMessage('id must be a valid UUID')]),
  (req: Request, res: Response) => {
    res.json({ id: req.params.id });
  }
);

// POST /api/v1/fans - register fan
fanRoutes.post(
  '/',
  validate([
    body('username').notEmpty().trim().isLength({ min: 3, max: 50 }).withMessage('username must be 3-50 chars'),
    body('email').isEmail().normalizeEmail().withMessage('valid email is required'),
    body('walletAddress').notEmpty().trim().withMessage('walletAddress is required'),
  ]),
  (req: Request, res: Response) => {
    res.status(201).json({ message: 'Fan registered', data: req.body });
  }
);

// POST /api/v1/fans/:id/follow - follow an artist
fanRoutes.post(
  '/:id/follow',
  validate([
    param('id').isUUID().withMessage('fan id must be a valid UUID'),
    body('artistId').isUUID().withMessage('artistId must be a valid UUID'),
  ]),
  (_req: Request, res: Response) => {
    res.json({ message: 'Artist followed' });
  }
);
