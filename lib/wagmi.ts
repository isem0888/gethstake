import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'wagmi/chains';
import { http } from 'wagmi';

export const wagmiConfig = getDefaultConfig({
  appName: 'GethStake',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet],
  transports: {
    [mainnet.id]: http('https://ethereum.publicnode.com'),
  },
  ssr: true,
});

export const SUPPORTED_CHAINS = [mainnet];
