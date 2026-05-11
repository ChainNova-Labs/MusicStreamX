import { useWalletStore } from '../store/walletStore';

export function WalletConnect() {
  const { isConnected, account, network, balance, isLoading, error, connect, disconnect } =
    useWalletStore();

  if (isConnected && account) {
    return (
      <div data-testid="wallet-connected" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <p data-testid="wallet-account" style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
            {account.slice(0, 6)}…{account.slice(-4)}
          </p>
          {balance !== null && (
            <p data-testid="wallet-balance" style={{ margin: 0, fontSize: 12, color: '#718096' }}>
              {balance} XLM
            </p>
          )}
          {network && (
            <p data-testid="wallet-network" style={{ margin: 0, fontSize: 11, color: '#a0aec0' }}>
              {network}
            </p>
          )}
        </div>
        <button
          data-testid="disconnect-button"
          onClick={disconnect}
          style={{
            background: '#fc8181',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div data-testid="wallet-disconnected">
      {error && (
        <p data-testid="wallet-error" style={{ color: '#e53e3e', fontSize: 13, margin: '0 0 8px' }}>
          {error}
        </p>
      )}
      <button
        data-testid="connect-button"
        onClick={connect}
        disabled={isLoading}
        style={{
          background: '#667eea',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 16px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {isLoading ? 'Connecting…' : 'Connect Wallet'}
      </button>
    </div>
  );
}
