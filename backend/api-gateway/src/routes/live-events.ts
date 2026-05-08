import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate';

export const liveEventsRoutes = Router();

// GET /api/v1/live-events
liveEventsRoutes.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ]),
  (req: Request, res: Response) => {
    res.json({ events: [] });
  }
);

// GET /api/v1/live-events/:id
liveEventsRoutes.get(
  '/:id',
  validate([param('id').isUUID().withMessage('id must be a valid UUID')]),
  (req: Request, res: Response) => {
    res.json({ id: req.params.id });
  }
);

// POST /api/v1/live-events - create event
liveEventsRoutes.post(
  '/',
  validate([
    body('title').notEmpty().trim().isLength({ max: 200 }).withMessage('title is required (max 200 chars)'),
    body('artistId').isUUID().withMessage('artistId must be a valid UUID'),
    body('scheduledAt').isISO8601().withMessage('scheduledAt must be a valid ISO 8601 date'),
    body('ticketPrice').isFloat({ min: 0 }).withMessage('ticketPrice must be a non-negative number'),
    body('maxAttendees').isInt({ min: 1 }).withMessage('maxAttendees must be a positive integer'),
  ]),
  (req: Request, res: Response) => {
    res.status(201).json({ message: 'Event created', data: req.body });
  }
);

// PUT /api/v1/live-events/:id
liveEventsRoutes.put(
  '/:id',
  validate([
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('title').optional().trim().isLength({ max: 200 }),
    body('scheduledAt').optional().isISO8601(),
    body('ticketPrice').optional().isFloat({ min: 0 }),
  ]),
  (req: Request, res: Response) => {
    res.json({ message: 'Event updated', id: req.params.id });
  }
);
