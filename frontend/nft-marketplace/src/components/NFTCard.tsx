import type { NFT } from '../types/nft';

interface Props {
  nft: NFT;
  currentUserId?: string;
  onBuy: (nft: NFT) => void;
  onList: (nft: NFT) => void;
  onDelist: (nft: NFT) => void;
}

export function NFTCard({ nft, currentUserId, onBuy, onList, onDelist }: Props) {
  const isOwner = currentUserId === nft.ownerId;

  return (
    <div
      data-testid="nft-card"
      className="nft-card"
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: 16,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          height: 160,
          background: 'linear-gradient(135deg,#667eea,#764ba2)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 32,
        }}
      >
        🎵
      </div>

      <h3 style={{ margin: 0, fontSize: 16 }}>{nft.title ?? `Edition #${nft.edition}`}</h3>
      <p style={{ margin: 0, color: '#718096', fontSize: 14 }}>{nft.artist ?? nft.artistId}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 18 }}>{nft.price} XLM</span>
        <span style={{ fontSize: 12, color: '#a0aec0' }}>Royalty: {nft.royaltyPercent}%</span>
      </div>

      {nft.listed && !isOwner && (
        <button
          data-testid="buy-button"
          onClick={() => onBuy(nft)}
          style={{
            background: '#667eea',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 0',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Buy Now
        </button>
      )}

      {isOwner && !nft.listed && (
        <button
          data-testid="list-button"
          onClick={() => onList(nft)}
          style={{
            background: '#48bb78',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 0',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          List for Sale
        </button>
      )}

      {isOwner && nft.listed && (
        <button
          data-testid="delist-button"
          onClick={() => onDelist(nft)}
          style={{
            background: '#fc8181',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 0',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Delist
        </button>
      )}

      {!nft.listed && !isOwner && (
        <span style={{ color: '#a0aec0', textAlign: 'center', fontSize: 14 }}>Not for sale</span>
      )}
    </div>
  );
}
