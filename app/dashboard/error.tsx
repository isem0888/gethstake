'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard error]', error);
  }, [error]);

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif',
      background: '#06070f',
      minHeight: '100vh',
      color: '#e8eaf8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#0d1121',
        border: '1px solid #1a2040',
        borderRadius: 14,
        padding: '32px 28px',
        maxWidth: 540,
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 18, marginBottom: 8 }}>
          Dashboard error
        </h2>
        <p style={{ color: '#5a6480', fontSize: 13, marginBottom: 16 }}>
          {error.message || 'An unexpected error occurred'}
        </p>
        {error.digest && (
          <p style={{ color: '#3a4566', fontSize: 11, marginBottom: 16, fontFamily: 'monospace' }}>
            digest: {error.digest}
          </p>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              background: '#60a5fa', color: '#040e24', border: 'none',
              borderRadius: 10, padding: '12px 24px',
              fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700,
              fontSize: 13, cursor: 'pointer',
            }}
          >
            Retry
          </button>
          <button
            onClick={() => { window.location.href = '/'; }}
            style={{
              background: 'none', color: '#5a6480',
              border: '1px solid #1a2040', borderRadius: 10,
              padding: '12px 24px', fontSize: 13, cursor: 'pointer',
            }}
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
