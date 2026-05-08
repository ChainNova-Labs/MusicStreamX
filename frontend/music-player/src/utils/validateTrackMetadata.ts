import { TrackMetadataInput, ValidationResult, ValidationError, Genre } from '../types/track';

const VALID_GENRES: Genre[] = [
  'pop', 'rock', 'hip-hop', 'jazz', 'classical', 'electronic',
  'r&b', 'country', 'reggae', 'blues', 'folk', 'metal', 'other',
];

// Matches IPFS CIDv0 (Qm...) or CIDv1 (bafy...)
const IPFS_CID_PATTERN = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z2-7]{52,})$/;

export function validateTrackMetadata(input: Partial<TrackMetadataInput>): ValidationResult {
  const errors: ValidationError[] = [];

  // title
  if (!input.title || input.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (input.title.trim().length > 200) {
    errors.push({ field: 'title', message: 'Title must be 200 characters or fewer' });
  }

  // artist
  if (!input.artist || input.artist.trim().length === 0) {
    errors.push({ field: 'artist', message: 'Artist is required' });
  } else if (input.artist.trim().length > 200) {
    errors.push({ field: 'artist', message: 'Artist must be 200 characters or fewer' });
  }

  // genre
  if (!input.genre) {
    errors.push({ field: 'genre', message: 'Genre is required' });
  } else if (!VALID_GENRES.includes(input.genre)) {
    errors.push({ field: 'genre', message: `Genre must be one of: ${VALID_GENRES.join(', ')}` });
  }

  // duration
  if (input.duration === undefined || input.duration === null) {
    errors.push({ field: 'duration', message: 'Duration is required' });
  } else if (!Number.isInteger(input.duration) || input.duration < 1 || input.duration > 86400) {
    errors.push({ field: 'duration', message: 'Duration must be a whole number of seconds between 1 and 86400' });
  }

  // ipfs_hash
  if (!input.ipfs_hash || input.ipfs_hash.trim().length === 0) {
    errors.push({ field: 'ipfs_hash', message: 'IPFS hash is required' });
  } else if (!IPFS_CID_PATTERN.test(input.ipfs_hash.trim())) {
    errors.push({ field: 'ipfs_hash', message: 'IPFS hash must be a valid CID (CIDv0 or CIDv1)' });
  }

  // optional: album
  if (input.album !== undefined && input.album.trim().length > 200) {
    errors.push({ field: 'album', message: 'Album must be 200 characters or fewer' });
  }

  // optional: year
  if (input.year !== undefined) {
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(input.year) || input.year < 1900 || input.year > currentYear) {
      errors.push({ field: 'year', message: `Year must be between 1900 and ${currentYear}` });
    }
  }

  // optional: description
  if (input.description !== undefined && input.description.trim().length > 1000) {
    errors.push({ field: 'description', message: 'Description must be 1000 characters or fewer' });
  }

  // optional: cover_image_hash
  if (input.cover_image_hash !== undefined && !IPFS_CID_PATTERN.test(input.cover_image_hash.trim())) {
    errors.push({ field: 'cover_image_hash', message: 'Cover image hash must be a valid IPFS CID' });
  }

  // optional: collaborators
  if (input.collaborators !== undefined) {
    if (input.collaborators.length > 10) {
      errors.push({ field: 'collaborators', message: 'Maximum 10 collaborators allowed' });
    }
    input.collaborators.forEach((c, i) => {
      if (!c.address || c.address.trim().length === 0) {
        errors.push({ field: `collaborators.${i}.address`, message: 'Collaborator address is required' });
      }
      if (c.share < 0 || c.share > 100) {
        errors.push({ field: `collaborators.${i}.share`, message: 'Collaborator share must be between 0 and 100' });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/** Returns a sanitized copy of the input (trims strings, removes unknown keys). */
export function sanitizeTrackMetadata(input: Partial<TrackMetadataInput>): Partial<TrackMetadataInput> {
  return {
    ...(input.title !== undefined && { title: input.title.trim() }),
    ...(input.artist !== undefined && { artist: input.artist.trim() }),
    ...(input.genre !== undefined && { genre: input.genre }),
    ...(input.duration !== undefined && { duration: input.duration }),
    ...(input.ipfs_hash !== undefined && { ipfs_hash: input.ipfs_hash.trim() }),
    ...(input.album !== undefined && { album: input.album.trim() }),
    ...(input.year !== undefined && { year: input.year }),
    ...(input.description !== undefined && { description: input.description.trim() }),
    ...(input.cover_image_hash !== undefined && { cover_image_hash: input.cover_image_hash.trim() }),
    ...(input.collaborators !== undefined && { collaborators: input.collaborators }),
  };
}
