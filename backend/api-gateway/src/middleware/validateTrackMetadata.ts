import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// IPFS CIDv0 (Qm...) or CIDv1 (bafy...) format
const ipfsHashPattern = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z2-7]{52,})$/;

const trackMetadataSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  artist: Joi.string().trim().min(1).max(200).required(),
  genre: Joi.string()
    .trim()
    .valid(
      'pop', 'rock', 'hip-hop', 'jazz', 'classical', 'electronic',
      'r&b', 'country', 'reggae', 'blues', 'folk', 'metal', 'other'
    )
    .required(),
  duration: Joi.number().integer().min(1).max(86400).required(), // seconds, max 24h
  ipfs_hash: Joi.string().pattern(ipfsHashPattern).required().messages({
    'string.pattern.base': 'ipfs_hash must be a valid IPFS CID (CIDv0 or CIDv1)',
  }),
  album: Joi.string().trim().max(200).optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
  description: Joi.string().trim().max(1000).optional(),
  cover_image_hash: Joi.string().pattern(ipfsHashPattern).optional().messages({
    'string.pattern.base': 'cover_image_hash must be a valid IPFS CID',
  }),
  collaborators: Joi.array()
    .items(
      Joi.object({
        address: Joi.string().trim().required(),
        share: Joi.number().min(0).max(100).required(),
      })
    )
    .max(10)
    .optional(),
});

export function validateTrackMetadata(req: Request, res: Response, next: NextFunction): void {
  const { error, value } = trackMetadataSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true, // sanitize: remove unknown fields
  });

  if (error) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })),
    });
    return;
  }

  // Replace body with sanitized value
  req.body = value;
  next();
}
