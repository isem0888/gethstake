'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

/**
 * Invisible component — fires a Telegram notification when a wallet connects.
 * Sends only once per unique address per browser session (tracked in sessionStorage).
 */
export function WalletTracker() {
  const { address, isConnected } = useAccount();
  const sentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) return;

    // Check sessionStorage so we don't spam on every page refresh
    const key = `tg_notified_${address.toLowerCase()}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(key)) return;
    if (sentRef.current === address) return;

    sentRef.current = address;

    fetch('/api/notify/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: address }),
    })
      .then(() => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(key, '1');
        }
      })
      .catch(() => {}); // silent fail — never break UX for a notification
  }, [isConnected, address]);

  return null; // renders nothing
}
