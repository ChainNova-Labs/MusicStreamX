import { create } from 'zustand';
import { Track } from '../types/track';

interface MusicPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  repeat: 'off' | 'all' | 'one';
  shuffle: boolean;
  queue: Track[];
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setRepeat: (repeat: 'off' | 'all' | 'one') => void;
  setShuffle: (shuffle: boolean) => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const useMusicPlayerStore = create<MusicPlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 80,
  progress: 0,
  duration: 0,
  repeat: 'off',
  shuffle: false,
  queue: [],
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  setProgress: (progress) => set({ progress }),
  setRepeat: (repeat) => set({ repeat }),
  setShuffle: (shuffle) => set({ shuffle }),
  playNext: () => {
    const { queue, currentTrack, shuffle } = get();
    if (!queue.length) return;
    const idx = queue.findIndex((t) => t.id === currentTrack?.id);
    const next = shuffle
      ? queue[Math.floor(Math.random() * queue.length)]
      : queue[(idx + 1) % queue.length];
    set({ currentTrack: next, progress: 0 });
  },
  playPrevious: () => {
    const { queue, currentTrack } = get();
    if (!queue.length) return;
    const idx = queue.findIndex((t) => t.id === currentTrack?.id);
    const prev = queue[(idx - 1 + queue.length) % queue.length];
    set({ currentTrack: prev, progress: 0 });
  },
}));
