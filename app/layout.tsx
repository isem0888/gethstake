import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { DeadlineBanner } from '@/components/DeadlineBanner';

export const metadata: Metadata = {
  title: 'GethStake — Stake. Earn. Own a validator.',
  description: 'Pool your ETH with others to run Ethereum validators. Start from 8 ETH, earn real yield paid in ETH.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DeadlineBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
