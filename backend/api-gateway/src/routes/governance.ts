import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate';

export const governanceRoutes = Router();

// GET /api/v1/governance/proposals
governanceRoutes.get(
  '/proposals',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'passed', 'rejected']).withMessage('status must be active, passed, or rejected'),
  ]),
  (req: Request, res: Response) => {
    res.json({ proposals: [] });
  }
);

// GET /api/v1/governance/proposals/:id
governanceRoutes.get(
  '/proposals/:id',
  validate([param('id').isUUID().withMessage('id must be a valid UUID')]),
  (req: Request, res: Response) => {
    res.json({ id: req.params.id });
  }
);

// POST /api/v1/governance/proposals - create proposal
governanceRoutes.post(
  '/proposals',
  validate([
    body('title').notEmpty().trim().isLength({ max: 200 }).withMessage('title is required (max 200 chars)'),
    body('description').notEmpty().trim().isLength({ max: 5000 }).withMessage('description is required (max 5000 chars)'),
    body('proposerId').isUUID().withMessage('proposerId must be a valid UUID'),
    body('votingEndsAt').isISO8601().withMessage('votingEndsAt must be a valid ISO 8601 date'),
  ]),
  (req: Request, res: Response) => {
    res.status(201).json({ message: 'Proposal created', data: req.body });
  }
);

// POST /api/v1/governance/proposals/:id/vote - cast vote
governanceRoutes.post(
  '/proposals/:id/vote',
  validate([
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('voterId').isUUID().withMessage('voterId must be a valid UUID'),
    body('vote').isIn(['yes', 'no', 'abstain']).withMessage('vote must be yes, no, or abstain'),
  ]),
  (req: Request, res: Response) => {
    res.status(201).json({ message: 'Vote cast', proposalId: req.params.id });
  }
);
