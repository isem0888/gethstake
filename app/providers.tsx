'use client';

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

const gethstakeTheme = darkTheme({
  accentColor: '#9bfd4e',
  accentColorForeground: '#06210a',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});

// Override more colors to match site palette
const customTheme = {
  ...gethstakeTheme,
  colors: {
    ...gethstakeTheme.colors,
    modalBackground: '#0d130e',
    modalBorder: '#1d2c1f',
    menuItemBackground: '#111a12',
    profileForeground: '#0a0f0b',
    connectButtonBackground: 'transparent',
    connectButtonInnerBackground: '#0d130e',
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme} locale="en-US">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
