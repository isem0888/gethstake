'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';

const STAKING_ADDRESS = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '0x5C4Cc49A0a4Ded7F553Be50dBf3886035A6DF28F') as `0x${string}`;

interface Props {
  amount: number;
  days: number;
  apr: number;
  periodGain: number;
  total: number;
  lang: 'en' | 'ru';
  onClose: () => void;
}

function getBonus(eth: number, days: number): number {
  if (eth >= 128) return days === 30 ? 1.1 : days === 90 ? 2.0 : 2.2;
  if (eth >= 96)  return days === 30 ? 1.0 : days === 90 ? 1.7 : 1.8;
  if (eth >= 64)  return days === 30 ? 0.8 : days === 90 ? 1.5 : 1.5;
  if (eth >= 32)  return days === 30 ? 0.4 : days === 90 ? 0.5 : 1.0;
  return 0;
}

function ownershipLabel(eth: number, lang: 'en' | 'ru') {
  if (eth >= 128) return lang === 'ru' ? '4 валидатора (макс)' : '4 validators (max)';
  if (eth >= 96)  return lang === 'ru' ? '3 валидатора' : '3 validators';
  if (eth >= 64)  return lang === 'ru' ? '2 валидатора' : '2 validators';
  if (eth >= 32)  return lang === 'ru' ? '1 полный узел' : '1 full validator';
  if (eth >= 24)  return lang === 'ru' ? '¾ узла' : '¾ node';
  if (eth >= 16)  return lang === 'ru' ? '½ узла' : '½ node';
  return lang === 'ru' ? '¼ узла' : '¼ node';
}

function fmtEth(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export function StakeModal({ amount, days, apr, periodGain, total, lang, onClose }: Props) {
  const { address, connector } = useAccount();
  const [step, setStep] = useState<'confirm' | 'pending' | 'success' | 'error'>('confirm');
  const [errMsg, setErrMsg] = useState('');
  const [txHash, setTxHash] = useState('');

  const bonus = getBonus(amount, days);
  const effectiveApr = apr;
  const effectivePeriodGain = amount * effectiveApr / 100 * days / 365;
  const effectiveTotal = amount + effectivePeriodGain;

  const PLATFORM_CLOSE = new Date('2027-01-01T00:00:00Z');
  const endsAt = new Date(Date.now() + days * 86_400_000);
  const exceedsDeadline = endsAt > PLATFORM_CLOSE;

  const handleConfirm = async () => {
    if (!address) {
      setErrMsg('Wallet not connected');
      setStep('error');
      return;
    }
    setStep('pending');
    try {
      const valueHex = '0x' + parseEther(String(amount)).toString(16);
      const txParams = [{ from: address, to: STAKING_ADDRESS, value: valueHex }];

      let hash: string | undefined;

      // Приоритет 1: window.ethereum (Trust Wallet browser, MetaMask mobile browser, etc.)
      // — самый совместимый путь, без WalletConnect relay и EIP-5792
      const win = typeof window !== 'undefined' ? (window as any) : null;
      if (win?.ethereum?.request) {
        hash = await win.ethereum.request({ method: 'eth_sendTransaction', params: txParams });
      }

      // Приоритет 2: wagmi connector provider (WalletConnect, Coinbase и т.д.)
      if (!hash && connector) {
        const provider = await connector.getProvider() as any;
        if (provider?.request) {
          hash = await provider.request({ method: 'eth_sendTransaction', params: txParams });
        }
      }

      if (!hash) throw new Error('No wallet provider available');

      setTxHash(hash);

      // Записываем в БД
      await fetch('/api/stakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          amount_eth: amount,
          plan_days: days,
          tx_hash: hash,
        }),
      });

      setStep('success');
    } catch (e: any) {
      const raw: string = e?.message || e?.toString() || 'Transaction failed';
      let msg = raw.split('\n')[0];
      if (/insufficient funds/i.test(raw))               msg = 'Insufficient ETH balance.';
      else if (/user rejected|rejected the request/i.test(raw)) msg = 'Transaction rejected in wallet.';
      else if (/unknown rpc|rpc error/i.test(raw))       msg = 'Wallet RPC error. Try switching RPC in wallet settings.';
      else if (/network/i.test(raw))                     msg = 'Network error. Check your connection.';
      setErrMsg(msg);
      setStep('error');
    }
  };

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
  };
  const box: React.CSSProperties = {
    background: '#0d1121', border: '1px solid #1a2040', borderRadius: 20,
    padding: '32px 28px', maxWidth: 460, width: '100%', position: 'relative',
    fontFamily: 'Inter, sans-serif',
  };
  const row: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid #1a2040', fontSize: 14,
  };

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={box}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 18, background: 'none', border: 'none', color: '#5a6480', cursor: 'pointer', fontSize: 20 }}>✕</button>

        {/* ── CONFIRM ── */}
        {step === 'confirm' && (
          <>
            <h2 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 18, marginBottom: 6 }}>
              {lang === 'ru' ? 'Подтверждение стейкинга' : 'Confirm your staking position'}
            </h2>
            <p style={{ color: '#5a6480', fontSize: 12, marginBottom: 24 }}>
              {lang === 'ru' ? 'Проверьте параметры перед отправкой транзакции' : 'Review your parameters before sending the transaction'}
            </p>

            <div style={{ background: '#080b14', borderRadius: 12, padding: '4px 16px', marginBottom: 20 }}>
              {[
                { l: lang === 'ru' ? 'План' : 'Plan', v: `${days}-day lock` },
                { l: lang === 'ru' ? 'Сумма депозита' : 'Deposit amount', v: `${amount} ETH`, bold: true },
                { l: 'APR', v: `${effectiveApr.toFixed(1)}%`, color: '#60a5fa' },
                { l: lang === 'ru' ? 'Доход за период' : 'Yield for period', v: `+${fmtEth(effectivePeriodGain)} ETH`, color: '#60a5fa' },
                { l: lang === 'ru' ? 'Итого к выводу' : 'Total payout', v: `${fmtEth(effectiveTotal)} ETH` },
                { l: lang === 'ru' ? 'Доля узла' : 'Node ownership', v: ownershipLabel(amount, lang) },
                ...(bonus > 0 ? [{ l: lang === 'ru' ? 'Бонус к APR' : 'APR bonus', v: `+${bonus}% (${ownershipLabel(amount, lang)})`, color: '#60a5fa' }] : []),
              ].map((r: any) => (
                <div key={r.l} style={row}>
                  <span style={{ color: '#8a93b8' }}>{r.l}</span>
                  <b style={{ color: r.color || '#eaf3ea', fontFamily: r.bold ? "'Chakra Petch',sans-serif" : undefined, fontSize: r.bold ? 16 : 14 }}>{r.v}</b>
                </div>
              ))}
            </div>

            {exceedsDeadline && (
              <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid #f8717133', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ color: '#f87171', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                  ⚠️ {lang === 'ru'
                    ? `Этот план заканчивается ${endsAt.toLocaleDateString('ru-RU')} — после закрытия платформы 01.01.2027.`
                    : `This plan ends ${endsAt.toLocaleDateString('en-US')} — after platform close date 01.01.2027.`}
                </p>
              </div>
            )}

            <p style={{ color: '#5a6480', fontSize: 11, marginBottom: 20, lineHeight: 1.5 }}>
              {lang === 'ru'
                ? 'После нажатия кнопки откроется окно вашего кошелька для подтверждения транзакции.'
                : 'After clicking, your wallet will open to confirm the transaction.'}
            </p>

            <button
              onClick={handleConfirm}
              disabled={exceedsDeadline}
              style={{ width: '100%', background: exceedsDeadline ? '#3a4566' : '#60a5fa', color: exceedsDeadline ? '#5a6480' : '#040e24', border: 'none', borderRadius: 10, padding: '14px 0', fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '.5px', cursor: exceedsDeadline ? 'not-allowed' : 'pointer', textTransform: 'uppercase' }}
            >
              {lang === 'ru' ? 'Подтвердить и оплатить' : 'Confirm & Pay Transaction'}
            </button>
            <button onClick={onClose} style={{ width: '100%', background: 'none', border: '1px solid #1a2040', borderRadius: 10, padding: '11px 0', marginTop: 10, color: '#5a6480', cursor: 'pointer', fontSize: 13 }}>
              {lang === 'ru' ? 'Отмена' : 'Cancel'}
            </button>
          </>
        )}

        {/* ── PENDING ── */}
        {step === 'pending' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid #1a2040', borderTopColor: '#60a5fa', margin: '0 auto 18px', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h3 style={{ fontFamily: "'Chakra Petch',sans-serif", marginBottom: 8 }}>
              {lang === 'ru' ? 'Ожидание подтверждения...' : 'Waiting for confirmation...'}
            </h3>
            <p style={{ color: '#5a6480', fontSize: 12 }}>
              {lang === 'ru' ? 'Подтвердите транзакцию в кошельке' : 'Confirm the transaction in your wallet'}
            </p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style={{ fontFamily: "'Chakra Petch',sans-serif", color: '#22c55e', marginBottom: 8 }}>
              {lang === 'ru' ? 'Стейкинг запущен!' : 'Staking activated!'}
            </h3>
            <p style={{ color: '#8a93b8', fontSize: 13, marginBottom: 8 }}>
              {amount} ETH · {days}-day · {effectiveApr.toFixed(1)}% APR
            </p>
            {txHash && (
              <p style={{ color: '#5a6480', fontSize: 10, marginBottom: 20, wordBreak: 'break-all' }}>
                Tx: {txHash.slice(0, 14)}…{txHash.slice(-8)}
              </p>
            )}
            <button onClick={() => { onClose(); window.location.href = '/dashboard'; }} style={{ background: '#60a5fa', color: '#040e24', border: 'none', borderRadius: 10, padding: '12px 32px', fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {lang === 'ru' ? 'Открыть кабинет' : 'Open Dashboard'}
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h3 style={{ fontFamily: "'Chakra Petch',sans-serif", marginBottom: 8 }}>
              {lang === 'ru' ? 'Ошибка транзакции' : 'Transaction failed'}
            </h3>
            <p style={{ color: '#5a6480', fontSize: 12, marginBottom: 24, lineHeight: 1.5 }}>{errMsg}</p>
            <button onClick={() => setStep('confirm')} style={{ background: '#60a5fa', color: '#040e24', border: 'none', borderRadius: 10, padding: '12px 32px', fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {lang === 'ru' ? 'Попробовать снова' : 'Try again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
