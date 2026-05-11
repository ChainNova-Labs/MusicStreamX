import { useEffect, useState, useCallback } from 'react';
import { NFTCard } from '../components/NFTCard';
import { fetchListedNFTs, buyNFT, listNFT, delistNFT } from '../api/nftApi';
import type { NFT, BuyResult } from '../types/nft';

// Demo current user — in production this comes from wallet/auth
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export function NFTMarketplace() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { nfts: data } = await fetchListedNFTs();
      setNfts(data);
    } catch {
      setError('Failed to load NFTs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBuy = async (nft: NFT) => {
    try {
      const result: BuyResult = await buyNFT(nft.id, DEMO_USER_ID);
      const { distribution, isSecondarySale } = result.transaction;
      notify(
        `Purchased! ${isSecondarySale ? `Royalty ${distribution.royaltyAmount.toFixed(2)} XLM paid to artist.` : ''}`
      );
      load();
    } catch {
      notify('Purchase failed. Please try again.');
    }
  };

  const handleList = async (nft: NFT) => {
    const priceStr = window.prompt('Enter listing price (XLM):', String(nft.price));
    if (!priceStr) return;
    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) { notify('Invalid price.'); return; }
    try {
      await listNFT(nft.id, price, DEMO_USER_ID);
      notify('NFT listed for sale!');
      load();
    } catch {
      notify('Failed to list NFT.');
    }
  };

  const handleDelist = async (nft: NFT) => {
    try {
      await delistNFT(nft.id, DEMO_USER_ID);
      notify('NFT delisted.');
      load();
    } catch {
      notify('Failed to delist NFT.');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>🎵 NFT Marketplace</h1>
      <p style={{ color: '#718096', marginBottom: 24 }}>
        Buy and sell music NFTs. Secondary sales include automatic royalty distribution to artists.
      </p>

      {notification && (
        <div
          data-testid="notification"
          style={{
            background: '#ebf8ff',
            border: '1px solid #90cdf4',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
            color: '#2b6cb0',
          }}
        >
          {notification}
        </div>
      )}

      {loading && <p data-testid="loading">Loading NFTs…</p>}
      {error && <p data-testid="error" style={{ color: '#e53e3e' }}>{error}</p>}

      {!loading && !error && nfts.length === 0 && (
        <p data-testid="empty">No NFTs listed for sale yet.</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 20,
        }}
      >
        {nfts.map((nft) => (
          <NFTCard
            key={nft.id}
            nft={nft}
            currentUserId={DEMO_USER_ID}
            onBuy={handleBuy}
            onList={handleList}
            onDelist={handleDelist}
          />
        ))}
      </div>
    </div>
  );
}
