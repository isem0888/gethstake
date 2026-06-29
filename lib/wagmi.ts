import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'GethStake',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet, sepolia],
  ssr: true,
});

export const SUPPORTED_CHAINS = [mainnet, sepolia];
