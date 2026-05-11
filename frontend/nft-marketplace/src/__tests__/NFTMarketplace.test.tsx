import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NFTMarketplace } from '../pages/NFTMarketplace';
import type { NFT } from '../types/nft';

const mockFetchListedNFTs = vi.fn();

vi.mock('../api/nftApi', () => ({
  fetchListedNFTs: (...args: unknown[]) => mockFetchListedNFTs(...args),
  buyNFT: vi.fn(),
  listNFT: vi.fn(),
  delistNFT: vi.fn(),
}));

const mockNFT: NFT = {
  id: '6fa5be20-f839-4fc9-b4f3-c45281a961ff',
  trackId: '992082bc-0fdb-45db-a3ab-862752f0e22f',
  artistId: '3f08afa9-a277-4400-97f0-625307980c0c',
  ownerId: '3f08afa9-a277-4400-97f0-625307980c0c',
  edition: 1,
  price: 100,
  royaltyPercent: 10,
  listed: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  title: 'Cool Track',
  artist: 'Cool Artist',
};

describe('NFTMarketplace page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockFetchListedNFTs.mockReturnValue(new Promise(() => {}));
    render(<NFTMarketplace />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders NFT cards after loading', async () => {
    mockFetchListedNFTs.mockResolvedValue({ nfts: [mockNFT], total: 1 });
    render(<NFTMarketplace />);
    await waitFor(() => expect(screen.getByText('Cool Track')).toBeInTheDocument());
    expect(screen.getByTestId('nft-card')).toBeInTheDocument();
  });

  it('shows empty state when no NFTs', async () => {
    mockFetchListedNFTs.mockResolvedValue({ nfts: [], total: 0 });
    render(<NFTMarketplace />);
    await waitFor(() => expect(screen.getByTestId('empty')).toBeInTheDocument());
  });

  it('shows error state on fetch failure', async () => {
    mockFetchListedNFTs.mockRejectedValue(new Error('Network error'));
    render(<NFTMarketplace />);
    await waitFor(() => expect(screen.getByTestId('error')).toBeInTheDocument());
  });
});
