import { Router, Request, Response } from 'express';
import { validateTrackMetadata } from '../middleware/validateTrackMetadata';

export const musicRoutes = Router();

// POST /api/v1/music - Create a new track (with validation + sanitization)
musicRoutes.post('/', validateTrackMetadata, (req: Request, res: Response) => {
  // req.body is already validated and sanitized by the middleware
  res.status(201).json({
    success: true,
    message: 'Track metadata validated and accepted',
    data: req.body,
  });
});

// GET /api/v1/music - List tracks (placeholder)
musicRoutes.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

// GET /api/v1/music/:id - Get a single track (placeholder)
musicRoutes.get('/:id', (req: Request, res: Response) => {
  res.json({ success: true, data: { id: req.params.id } });
});
