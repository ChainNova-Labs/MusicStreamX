import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate';

export const streamingRoutes = Router();

// GET /api/v1/streaming/:trackId - get stream URL
streamingRoutes.get(
  '/:trackId',
  validate([param('trackId').isUUID().withMessage('trackId must be a valid UUID')]),
  (req: Request, res: Response) => {
    res.json({ streamUrl: `https://ipfs.io/ipfs/placeholder-${req.params.trackId}` });
  }
);

// POST /api/v1/streaming/play - record a play event
streamingRoutes.post(
  '/play',
  validate([
    body('trackId').isUUID().withMessage('trackId must be a valid UUID'),
    body('fanId').isUUID().withMessage('fanId must be a valid UUID'),
    body('durationPlayed').isInt({ min: 0 }).withMessage('durationPlayed must be a non-negative integer'),
  ]),
  (req: Request, res: Response) => {
    res.status(201).json({ message: 'Play recorded', data: req.body });
  }
);
