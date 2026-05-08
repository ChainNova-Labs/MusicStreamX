export type Genre =
  | 'pop' | 'rock' | 'hip-hop' | 'jazz' | 'classical' | 'electronic'
  | 'r&b' | 'country' | 'reggae' | 'blues' | 'folk' | 'metal' | 'other';

export interface Collaborator {
  address: string;
  share: number; // 0-100
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: Genre;
  duration: number; // seconds
  ipfs_hash: string;
  album?: string;
  year?: number;
  description?: string;
  cover_image_hash?: string;
  collaborators?: Collaborator[];
}

export type TrackMetadataInput = Omit<Track, 'id'>;

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
