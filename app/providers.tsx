'use client';

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

const gethstakeTheme = darkTheme({
  accentColor: '#60a5fa',
  accentColorForeground: '#040e24',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});

// Override more colors to match site palette
const customTheme = {
  ...gethstakeTheme,
  colors: {
    ...gethstakeTheme.colors,
    modalBackground: '#0d1121',
    modalBorder: '#1a2040',
    menuItemBackground: '#101629',
    profileForeground: '#080b14',
    connectButtonBackground: 'transparent',
    connectButtonInnerBackground: '#0d1121',
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
