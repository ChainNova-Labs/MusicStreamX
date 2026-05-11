import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NFTCard } from '../components/NFTCard';
import type { NFT } from '../types/nft';

const baseNFT: NFT = {
  id: 'c0000000-0000-0000-0000-000000000003',
  trackId: 'd0000000-0000-0000-0000-000000000004',
  artistId: 'a0000000-0000-0000-0000-000000000001',
  ownerId: 'a0000000-0000-0000-0000-000000000001',
  edition: 1,
  price: 100,
  royaltyPercent: 10,
  listed: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  title: 'Test Track',
  artist: 'Test Artist',
};

describe('NFTCard', () => {
  it('renders NFT title and price', () => {
    render(
      <NFTCard nft={baseNFT} onBuy={vi.fn()} onList={vi.fn()} onDelist={vi.fn()} />
    );
    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('100 XLM')).toBeInTheDocument();
    expect(screen.getByText('Royalty: 10%')).toBeInTheDocument();
  });

  it('shows Buy button for non-owner when listed', () => {
    const onBuy = vi.fn();
    render(
      <NFTCard
        nft={baseNFT}
        currentUserId="b0000000-0000-0000-0000-000000000002"
        onBuy={onBuy}
        onList={vi.fn()}
        onDelist={vi.fn()}
      />
    );
    const btn = screen.getByTestId('buy-button');
    fireEvent.click(btn);
    expect(onBuy).toHaveBeenCalledWith(baseNFT);
  });

  it('shows List button for owner when not listed', () => {
    const onList = vi.fn();
    const unlistedNFT = { ...baseNFT, listed: false };
    render(
      <NFTCard
        nft={unlistedNFT}
        currentUserId={baseNFT.ownerId}
        onBuy={vi.fn()}
        onList={onList}
        onDelist={vi.fn()}
      />
    );
    const btn = screen.getByTestId('list-button');
    fireEvent.click(btn);
    expect(onList).toHaveBeenCalledWith(unlistedNFT);
  });

  it('shows Delist button for owner when listed', () => {
    const onDelist = vi.fn();
    render(
      <NFTCard
        nft={baseNFT}
        currentUserId={baseNFT.ownerId}
        onBuy={vi.fn()}
        onList={vi.fn()}
        onDelist={onDelist}
      />
    );
    const btn = screen.getByTestId('delist-button');
    fireEvent.click(btn);
    expect(onDelist).toHaveBeenCalledWith(baseNFT);
  });

  it('shows "Not for sale" for non-owner when not listed', () => {
    const unlistedNFT = { ...baseNFT, listed: false };
    render(
      <NFTCard
        nft={unlistedNFT}
        currentUserId="b0000000-0000-0000-0000-000000000002"
        onBuy={vi.fn()}
        onList={vi.fn()}
        onDelist={vi.fn()}
      />
    );
    expect(screen.getByText('Not for sale')).toBeInTheDocument();
  });

  it('falls back to edition number when no title', () => {
    const noTitle = { ...baseNFT, title: undefined };
    render(
      <NFTCard nft={noTitle} onBuy={vi.fn()} onList={vi.fn()} onDelist={vi.fn()} />
    );
    expect(screen.getByText('Edition #1')).toBeInTheDocument();
  });
});
