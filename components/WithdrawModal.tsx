'use client';

import { useState } from 'react';

interface Props {
  stakeId: string;
  walletAddress: string;
  amountEth: number;
  planDays: number;
  endsAt: string;
  earnedEth: number;
  lang: 'en' | 'ru';
  onClose: () => void;
  onSuccess: () => void;
}

export function WithdrawModal({
  stakeId, walletAddress, amountEth, planDays, endsAt,
  earnedEth, lang, onClose, onSuccess,
}: Props) {
  const [step, setStep] = useState<'form' | 'confirm' | 'pending' | 'done' | 'error'>('form');
  const [toAddress, setToAddress] = useState(walletAddress);
  const [errMsg, setErrMsg] = useState('');

  const isEarly = new Date(endsAt).getTime() > Date.now();
  const payoutEth = isEarly ? amountEth : amountEth + earnedEth;

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 300,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  };
  const box: React.CSSProperties = {
    background: '#0d1121', border: '1px solid #1a2040', borderRadius: 20,
    padding: '28px 24px', maxWidth: 460, width: '100%', position: 'relative',
    fontFamily: 'Inter, sans-serif',
  };
  const row: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 0', borderBottom: '1px solid #1a2040', fontSize: 13,
  };

  const handleSubmit = () => {
    if (!toAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
      setErrMsg(lang === 'ru' ? 'Неверный адрес кошелька' : 'Invalid wallet address');
      return;
    }
    setErrMsg('');
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setStep('pending');
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          stake_id: stakeId,
          amount_eth: payoutEth,
          to_address: toAddress,
          early: isEarly,
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStep('done');
    } catch {
      setErrMsg(lang === 'ru' ? 'Ошибка отправки запроса. Попробуйте снова.' : 'Request failed. Please try again.');
      setStep('error');
    }
  };

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={box}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: '#5a6480', cursor: 'pointer', fontSize: 20 }}>✕</button>

        {/* ── FORM ── */}
        {step === 'form' && (
          <>
            <h2 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 17, marginBottom: 6 }}>
              {lang === 'ru' ? 'Вывод средств' : 'Withdraw funds'}
            </h2>
            <p style={{ color: '#5a6480', fontSize: 12, marginBottom: 20, lineHeight: 1.5 }}>
              {lang === 'ru' ? 'Запрос обрабатывается 1–3 рабочих дня' : 'Requests are processed within 1–3 business days'}
            </p>

            {/* Early withdrawal warning */}
            {isEarly && (
              <div style={{ background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.3)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ color: '#fbbf24', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  ⚠️ {lang === 'ru' ? 'Досрочный вывод' : 'Early withdrawal'}
                </div>
                <p style={{ color: '#d4a855', fontSize: 11, margin: 0, lineHeight: 1.6 }}>
                  {lang === 'ru'
                    ? 'Вы выводите средства до окончания плана. Вы получите только тело инвестиции без начисленных процентов.'
                    : 'You are withdrawing before the plan ends. You will receive only the principal — no yield will be paid.'}
                </p>
              </div>
            )}

            {/* Payout info */}
            <div style={{ background: '#080b14', borderRadius: 12, padding: '4px 16px', marginBottom: 18 }}>
              {[
                { l: lang === 'ru' ? 'Депозит' : 'Deposit', v: `${amountEth} ETH` },
                ...(isEarly ? [
                  { l: lang === 'ru' ? 'Доход (не выплачивается)' : 'Yield (forfeited)', v: `+${earnedEth.toFixed(4)} ETH`, muted: true, strike: true },
                ] : [
                  { l: lang === 'ru' ? 'Доход' : 'Yield earned', v: `+${earnedEth.toFixed(4)} ETH`, green: true },
                ]),
                { l: lang === 'ru' ? 'К выплате' : 'You will receive', v: `${payoutEth.toFixed(4)} ETH`, bold: true },
              ].map((r: any) => (
                <div key={r.l} style={row}>
                  <span style={{ color: r.muted ? '#3a4560' : '#8a93b8' }}>{r.l}</span>
                  <b style={{
                    color: r.bold ? '#fff' : r.green ? '#22c55e' : r.muted ? '#3a4560' : '#e8eaf8',
                    fontSize: r.bold ? 15 : 13,
                    textDecoration: r.strike ? 'line-through' : 'none',
                  }}>{r.v}</b>
                </div>
              ))}
            </div>

            {/* Recipient address */}
            <label style={{ fontSize: 11, color: '#8a93b8', textTransform: 'uppercase', letterSpacing: '.6px', display: 'block', marginBottom: 6 }}>
              {lang === 'ru' ? 'Кошелёк получателя' : 'Recipient wallet'}
            </label>
            <input
              value={toAddress}
              onChange={e => setToAddress(e.target.value)}
              placeholder="0x..."
              style={{ width: '100%', background: '#080b14', border: '1px solid #1a2040', borderRadius: 8, padding: '10px 12px', color: '#e8eaf8', fontFamily: 'monospace', fontSize: 12, outline: 'none', boxSizing: 'border-box', marginBottom: 6 }}
            />
            {errMsg && <div style={{ color: '#f87171', fontSize: 11, marginBottom: 10 }}>{errMsg}</div>}

            {/* Processing time explanation */}
            <div style={{ background: 'rgba(96,165,250,.06)', border: '1px solid rgba(96,165,250,.12)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, marginTop: 10 }}>
              <div style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                ⏳ {lang === 'ru' ? 'Почему 1–3 рабочих дня?' : 'Why 1–3 business days?'}
              </div>
              <p style={{ color: '#5a6480', fontSize: 11, margin: 0, lineHeight: 1.6 }}>
                {lang === 'ru'
                  ? 'Средства находятся в активных валидаторах Ethereum. Для вывода необходимо корректно выйти из очереди валидации — этот процесс регулируется протоколом и занимает время.'
                  : 'Funds are locked in active Ethereum validators. Withdrawal requires a proper validator exit queue — this is governed by the protocol and takes time.'}
              </p>
            </div>

            <button
              onClick={handleSubmit}
              style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 0', fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '.5px', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              {lang === 'ru' ? 'Продолжить вывод →' : 'Continue withdrawal →'}
            </button>
            <button onClick={onClose} style={{ width: '100%', background: 'none', border: '1px solid #1a2040', borderRadius: 10, padding: '10px 0', marginTop: 8, color: '#5a6480', cursor: 'pointer', fontSize: 13 }}>
              {lang === 'ru' ? 'Отмена' : 'Cancel'}
            </button>
          </>
        )}

        {/* ── CONFIRM ── */}
        {step === 'confirm' && (
          <>
            <h2 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 17, marginBottom: 6 }}>
              {lang === 'ru' ? 'Подтвердите вывод' : 'Confirm withdrawal'}
            </h2>
            <p style={{ color: '#5a6480', fontSize: 12, marginBottom: 20 }}>
              {lang === 'ru' ? 'После подтверждения запрос будет отправлен в обработку' : 'After confirming, the request will be sent for processing'}
            </p>
            <div style={{ background: '#080b14', borderRadius: 12, padding: '4px 16px', marginBottom: 20 }}>
              {[
                { l: lang === 'ru' ? 'Сумма вывода' : 'Withdrawal amount', v: `${payoutEth.toFixed(4)} ETH`, bold: true },
                { l: lang === 'ru' ? 'Адрес получателя' : 'Recipient', v: `${toAddress.slice(0,10)}…${toAddress.slice(-6)}` },
                { l: lang === 'ru' ? 'Тип' : 'Type', v: isEarly ? (lang === 'ru' ? 'Досрочный (без дохода)' : 'Early (no yield)') : (lang === 'ru' ? 'По окончании плана' : 'Plan completed'), warn: isEarly },
                { l: lang === 'ru' ? 'Срок обработки' : 'Processing time', v: lang === 'ru' ? '1–3 рабочих дня' : '1–3 business days' },
              ].map((r: any) => (
                <div key={r.l} style={row}>
                  <span style={{ color: '#8a93b8' }}>{r.l}</span>
                  <b style={{ color: r.bold ? '#fff' : r.warn ? '#fbbf24' : '#e8eaf8', fontSize: r.bold ? 15 : 13 }}>{r.v}</b>
                </div>
              ))}
            </div>
            <button
              onClick={handleConfirm}
              style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 0', fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase' }}
            >
              {lang === 'ru' ? '✓ Подтвердить вывод' : '✓ Confirm withdrawal'}
            </button>
            <button onClick={() => setStep('form')} style={{ width: '100%', background: 'none', border: '1px solid #1a2040', borderRadius: 10, padding: '10px 0', marginTop: 8, color: '#5a6480', cursor: 'pointer', fontSize: 13 }}>
              {lang === 'ru' ? '← Назад' : '← Back'}
            </button>
          </>
        )}

        {/* ── PENDING ── */}
        {step === 'pending' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #1a2040', borderTopColor: '#60a5fa', margin: '0 auto 18px', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h3 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 15, color: '#e8eaf8', marginBottom: 4 }}>
              {lang === 'ru' ? 'Отправляем запрос...' : 'Sending request...'}
            </h3>
          </div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 16, color: '#e8eaf8', marginBottom: 8 }}>
              {lang === 'ru' ? 'Запрос принят' : 'Request submitted'}
            </h3>
            <p style={{ color: '#8a93b8', fontSize: 13, marginBottom: 6, lineHeight: 1.5 }}>
              {lang === 'ru'
                ? `${payoutEth.toFixed(4)} ETH будут отправлены в течение 1–3 рабочих дней.`
                : `${payoutEth.toFixed(4)} ETH will be sent within 1–3 business days.`}
            </p>
            <p style={{ color: '#5a6480', fontSize: 11, marginBottom: 24 }}>
              {lang === 'ru' ? 'На адрес: ' : 'To: '}<code style={{ color: '#8a93b8' }}>{toAddress.slice(0, 12)}…{toAddress.slice(-6)}</code>
            </p>
            <button onClick={() => { onSuccess(); onClose(); }} style={{ background: 'transparent', color: '#60a5fa', border: '1px solid #60a5fa', borderRadius: 8, padding: '10px 28px', fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', letterSpacing: '.4px' }}>
              {lang === 'ru' ? 'Закрыть' : 'Close'}
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h3 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 15, color: '#e8eaf8', marginBottom: 8 }}>
              {lang === 'ru' ? 'Ошибка' : 'Error'}
            </h3>
            <p style={{ color: '#5a6480', fontSize: 12, marginBottom: 24 }}>{errMsg}</p>
            <button onClick={() => setStep('form')} style={{ background: 'transparent', color: '#60a5fa', border: '1px solid #60a5fa', borderRadius: 8, padding: '10px 28px', fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              {lang === 'ru' ? 'Попробовать снова' : 'Try again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
