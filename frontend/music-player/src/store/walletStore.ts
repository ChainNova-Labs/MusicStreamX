import { create } from 'zustand';
import {
  isConnected as freighterIsConnected,
  requestAccess,
  getNetwork,
} from '@stellar/freighter-api';

export interface WalletState {
  isConnected: boolean;
  account: string | null;
  network: string | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  isConnected: false,
  account: null,
  network: null,
  balance: null,
  isLoading: false,
  error: null,

  connect: async () => {
    set({ isLoading: true, error: null });
    try {
      // Check Freighter is installed
      const connectedResult = await freighterIsConnected();
      if (!connectedResult.isConnected) {
        throw new Error('Freighter wallet is not installed. Please install the Freighter browser extension.');
      }

      // Request access / get public key
      const accessResult = await requestAccess();
      if (accessResult.error) {
        throw new Error(accessResult.error);
      }
      const address = accessResult.address;

      // Get current network
      const networkResult = await getNetwork();
      const network = networkResult.error ? null : networkResult.network;

      set({ isConnected: true, account: address, network, isLoading: false });

      // Fetch balance after connecting
      await get().refreshBalance();
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  disconnect: () => {
    set({ isConnected: false, account: null, network: null, balance: null, error: null });
  },

  refreshBalance: async () => {
    const { account } = get();
    if (!account) return;

    try {
      // Fetch XLM balance from Horizon
      const horizonUrl = 'https://horizon-testnet.stellar.org';
      const res = await fetch(`${horizonUrl}/accounts/${account}`);
      if (!res.ok) {
        set({ balance: null });
        return;
      }
      const data = await res.json();
      const xlmBalance = (data.balances as Array<{ asset_type: string; balance: string }>)
        .find((b) => b.asset_type === 'native');
      set({ balance: xlmBalance ? xlmBalance.balance : '0' });
    } catch {
      set({ balance: null });
    }
  },
}));
