import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletConnect } from '../components/WalletConnect';
import { useWalletStore } from '../store/walletStore';

// Mock the store
vi.mock('../store/walletStore');

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();

function setStoreState(overrides: Partial<ReturnType<typeof useWalletStore>>) {
  vi.mocked(useWalletStore).mockReturnValue({
    isConnected: false,
    account: null,
    network: null,
    balance: null,
    isLoading: false,
    error: null,
    connect: mockConnect,
    disconnect: mockDisconnect,
    refreshBalance: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useWalletStore>);
}

describe('WalletConnect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows connect button when disconnected', () => {
    setStoreState({});
    render(<WalletConnect />);
    expect(screen.getByTestId('connect-button')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-disconnected')).toBeInTheDocument();
  });

  it('calls connect when button is clicked', () => {
    setStoreState({});
    render(<WalletConnect />);
    fireEvent.click(screen.getByTestId('connect-button'));
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it('shows loading state while connecting', () => {
    setStoreState({ isLoading: true });
    render(<WalletConnect />);
    expect(screen.getByTestId('connect-button')).toBeDisabled();
    expect(screen.getByText('Connecting…')).toBeInTheDocument();
  });

  it('shows error message when connection fails', () => {
    setStoreState({ error: 'Freighter wallet is not installed.' });
    render(<WalletConnect />);
    expect(screen.getByTestId('wallet-error')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-error').textContent).toContain('not installed');
  });

  it('shows wallet info and disconnect button when connected', () => {
    setStoreState({
      isConnected: true,
      account: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTU',
      network: 'TESTNET',
      balance: '100.0000000',
    });
    render(<WalletConnect />);
    expect(screen.getByTestId('wallet-connected')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-account')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-balance')).toHaveTextContent('100.0000000 XLM');
    expect(screen.getByTestId('wallet-network')).toHaveTextContent('TESTNET');
    expect(screen.getByTestId('disconnect-button')).toBeInTheDocument();
  });

  it('calls disconnect when disconnect button is clicked', () => {
    setStoreState({
      isConnected: true,
      account: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTU',
    });
    render(<WalletConnect />);
    fireEvent.click(screen.getByTestId('disconnect-button'));
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('truncates long account address', () => {
    const longAddress = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTU';
    setStoreState({ isConnected: true, account: longAddress });
    render(<WalletConnect />);
    const accountEl = screen.getByTestId('wallet-account');
    expect(accountEl.textContent).toContain('GABCDE');
    expect(accountEl.textContent).toContain('RSTU');
  });
});
