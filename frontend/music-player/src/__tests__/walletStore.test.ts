import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useWalletStore } from '../store/walletStore';

// Mock @stellar/freighter-api
const mockIsConnected = vi.fn();
const mockRequestAccess = vi.fn();
const mockGetNetwork = vi.fn();

vi.mock('@stellar/freighter-api', () => ({
  isConnected: (...args: unknown[]) => mockIsConnected(...args),
  requestAccess: (...args: unknown[]) => mockRequestAccess(...args),
  getAddress: vi.fn(),
  getNetwork: (...args: unknown[]) => mockGetNetwork(...args),
}));

// Mock fetch for balance
const mockFetch = vi.fn();
global.fetch = mockFetch;

const TEST_ADDRESS = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

function resetStore() {
  useWalletStore.setState({
    isConnected: false,
    account: null,
    network: null,
    balance: null,
    isLoading: false,
    error: null,
  });
}

describe('walletStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  describe('initial state', () => {
    it('starts disconnected', () => {
      const { result } = renderHook(() => useWalletStore());
      expect(result.current.isConnected).toBe(false);
      expect(result.current.account).toBeNull();
      expect(result.current.balance).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('connect', () => {
    it('sets isConnected and account on success', async () => {
      mockIsConnected.mockResolvedValue({ isConnected: true });
      mockRequestAccess.mockResolvedValue({ address: TEST_ADDRESS });
      mockGetNetwork.mockResolvedValue({ network: 'TESTNET' });
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ balances: [{ asset_type: 'native', balance: '100.0000000' }] }),
      });

      const { result } = renderHook(() => useWalletStore());
      await act(async () => { await result.current.connect(); });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.account).toBe(TEST_ADDRESS);
      expect(result.current.network).toBe('TESTNET');
      expect(result.current.balance).toBe('100.0000000');
      expect(result.current.error).toBeNull();
    });

    it('sets error when Freighter is not installed', async () => {
      mockIsConnected.mockResolvedValue({ isConnected: false });

      const { result } = renderHook(() => useWalletStore());
      await act(async () => { await result.current.connect(); });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toMatch(/not installed/i);
    });

    it('sets error when requestAccess returns error', async () => {
      mockIsConnected.mockResolvedValue({ isConnected: true });
      mockRequestAccess.mockResolvedValue({ error: 'User rejected' });

      const { result } = renderHook(() => useWalletStore());
      await act(async () => { await result.current.connect(); });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBe('User rejected');
    });

    it('sets error when freighter throws', async () => {
      mockIsConnected.mockRejectedValue(new Error('Extension error'));

      const { result } = renderHook(() => useWalletStore());
      await act(async () => { await result.current.connect(); });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBe('Extension error');
    });
  });

  describe('disconnect', () => {
    it('clears all wallet state', async () => {
      // First connect
      mockIsConnected.mockResolvedValue({ isConnected: true });
      mockRequestAccess.mockResolvedValue({ address: TEST_ADDRESS });
      mockGetNetwork.mockResolvedValue({ network: 'TESTNET' });
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ balances: [{ asset_type: 'native', balance: '50.0' }] }),
      });

      const { result } = renderHook(() => useWalletStore());
      await act(async () => { await result.current.connect(); });
      expect(result.current.isConnected).toBe(true);

      act(() => { result.current.disconnect(); });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.account).toBeNull();
      expect(result.current.balance).toBeNull();
      expect(result.current.network).toBeNull();
    });
  });

  describe('refreshBalance', () => {
    it('sets balance to null when account is not set', async () => {
      const { result } = renderHook(() => useWalletStore());
      await act(async () => { await result.current.refreshBalance(); });
      expect(result.current.balance).toBeNull();
    });

    it('sets balance to null when Horizon returns non-ok', async () => {
      useWalletStore.setState({ account: TEST_ADDRESS });
      mockFetch.mockResolvedValue({ ok: false });

      const { result } = renderHook(() => useWalletStore());
      await act(async () => { await result.current.refreshBalance(); });
      expect(result.current.balance).toBeNull();
    });

    it('sets balance to 0 when no native balance found', async () => {
      useWalletStore.setState({ account: TEST_ADDRESS });
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ balances: [{ asset_type: 'credit_alphanum4', balance: '10.0' }] }),
      });

      const { result } = renderHook(() => useWalletStore());
      await act(async () => { await result.current.refreshBalance(); });
      expect(result.current.balance).toBe('0');
    });
  });
});
