'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useEffect } from 'react';

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Регистрируем пользователя в Supabase при подключении кошелька
  useEffect(() => {
    if (isConnected && address) {
      fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address }),
      }).catch(console.error);
    }
  }, [isConnected, address]);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {!connected ? (
              <button className="btn btn-wallet" onClick={openConnectModal}>
                Connect wallet
              </button>
            ) : chain.unsupported ? (
              <button className="btn btn-wallet" onClick={openChainModal} style={{ borderColor: '#ff4d4d', color: '#ff4d4d' }}>
                Wrong network
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-wallet wallet-chain-btn" onClick={openChainModal} style={{ padding: '9px 12px', fontSize: 12 }}>
                  {chain.hasIcon && chain.iconUrl && (
                    <img src={chain.iconUrl} alt={chain.name} style={{ width: 14, height: 14, borderRadius: '50%' }} />
                  )}
                  {chain.name}
                </button>
                <button className="btn btn-wallet wallet-account-btn" onClick={openAccountModal}>
                  {account.displayName}
                  <span className="wallet-balance">{account.displayBalance ? ` · ${account.displayBalance}` : ''}</span>
                </button>
                <button
                  className="btn btn-wallet wallet-disconnect-btn"
                  onClick={() => disconnect()}
                  style={{ padding: '9px 12px', fontSize: 12, borderColor: '#ff4d4d', color: '#ff4d4d' }}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
