import { createConfig, configureChains } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { darkTheme } from '@rainbow-me/rainbowkit';

export const { chains, publicClient } = configureChains([mainnet], [publicProvider()]);

export const wagmiConfig = createConfig({ autoConnect: true, publicClient });
export const rainbowKitTheme = darkTheme();
