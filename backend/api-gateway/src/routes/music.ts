import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import { validateTrackMetadata } from '../middleware/validateTrackMetadata';
import { ipfsService } from '../services/ipfsService';
import { logger } from '../utils/logger';

export const musicRoutes = Router();

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
});

/**
 * Simulates calling the Soroban streaming contract's register_track function.
 * In production this would use stellar-sdk to invoke the contract.
 */
export async function registerTrackOnChain(params: {
  ipfsHash: string;
  title: string;
  artist: string;
  duration: number;
  genre: string;
  artistAddress: string;
}): Promise<string> {
  const mockTxHash = `tx_${Date.now()}_${params.ipfsHash.slice(0, 8)}`;
  logger.info(`register_track called: ipfsHash=${params.ipfsHash} txHash=${mockTxHash}`);
  return mockTxHash;
}

// POST /api/v1/music/upload — full track upload flow
musicRoutes.post(
  '/upload',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('audio')(req, res, (err) => {
      if (err instanceof multer.MulterError || err instanceof Error) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'No audio file uploaded' });
      return;
    }

    const { title, artist, genre, duration, artistAddress } = req.body;

    if (!title || !artist || !genre || !duration || !artistAddress) {
      fs.unlinkSync(req.file.path);
      res.status(400).json({ error: 'Missing required fields: title, artist, genre, duration, artistAddress' });
      return;
    }

    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum < 1 || durationNum > 86400) {
      fs.unlinkSync(req.file.path);
      res.status(400).json({ error: 'duration must be an integer between 1 and 86400 seconds' });
      return;
    }

    try {
      // Step 1: Upload audio file to IPFS
      const ipfsHash = await ipfsService.uploadFile(req.file.path);

      // Step 2: Register track on-chain via streaming contract's register_track
      const txHash = await registerTrackOnChain({
        ipfsHash,
        title,
        artist,
        genre,
        duration: durationNum,
        artistAddress,
      });

      res.status(201).json({
        success: true,
        message: 'Track uploaded and registered successfully',
        data: {
          ipfsHash,
          ipfsUrl: ipfsService.getGatewayUrl(ipfsHash),
          txHash,
          title,
          artist,
          genre,
          duration: durationNum,
          artistAddress,
          filename: req.file.originalname,
          size: req.file.size,
        },
      });
    } catch (err) {
      logger.error('Track upload failed:', err);
      res.status(500).json({ error: 'Track upload failed', details: (err as Error).message });
    } finally {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  }
);

// POST /api/v1/music — Create a new track (metadata only)
musicRoutes.post('/', validateTrackMetadata, (req: Request, res: Response) => {
  res.status(201).json({
    success: true,
    message: 'Track metadata validated and accepted',
    data: req.body,
  });
});

// GET /api/v1/music — List tracks (placeholder)
musicRoutes.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

// GET /api/v1/music/:id — Get a single track (placeholder)
musicRoutes.get('/:id', (req: Request, res: Response) => {
  res.json({ success: true, data: { id: req.params.id } });
});
