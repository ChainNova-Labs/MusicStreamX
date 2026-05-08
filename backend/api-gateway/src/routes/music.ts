import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate';

export const musicRoutes = Router();

// GET /api/v1/music - list tracks
musicRoutes.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    query('genre').optional().isString().trim().escape(),
  ]),
  (req: Request, res: Response) => {
    res.json({ tracks: [], page: req.query.page || 1, limit: req.query.limit || 20 });
  }
);

// GET /api/v1/music/:id - get track by id
musicRoutes.get(
  '/:id',
  validate([
    param('id').isUUID().withMessage('id must be a valid UUID'),
  ]),
  (req: Request, res: Response) => {
    res.json({ id: req.params.id });
  }
);

// POST /api/v1/music - create track metadata
musicRoutes.post(
  '/',
  validate([
    body('title').notEmpty().trim().isLength({ max: 200 }).withMessage('title is required (max 200 chars)'),
    body('artistId').isUUID().withMessage('artistId must be a valid UUID'),
    body('genre').notEmpty().trim().isLength({ max: 50 }).withMessage('genre is required (max 50 chars)'),
    body('duration').isInt({ min: 1 }).withMessage('duration must be a positive integer (seconds)'),
    body('ipfsHash').optional().isString().trim(),
  ]),
  (req: Request, res: Response) => {
    res.status(201).json({ message: 'Track created', data: req.body });
  }
);

// PUT /api/v1/music/:id - update track metadata
musicRoutes.put(
  '/:id',
  validate([
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('title').optional().trim().isLength({ max: 200 }),
    body('genre').optional().trim().isLength({ max: 50 }),
    body('duration').optional().isInt({ min: 1 }),
  ]),
  (req: Request, res: Response) => {
    res.json({ message: 'Track updated', id: req.params.id });
  }
);
