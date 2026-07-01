'use client';

import { useState, useEffect } from 'react';

const PLATFORM_CLOSE = new Date('2027-01-01T00:00:00Z');

function daysUntil(targetDate: Date): number {
  return Math.max(0, Math.ceil((targetDate.getTime() - Date.now()) / 86_400_000));
}

function lastStartDate(planDays: number): Date {
  return new Date(PLATFORM_CLOSE.getTime() - planDays * 86_400_000);
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function DeadlineBanner() {
  const [, setTick] = useState(0);

  // Обновляем раз в минуту чтобы счётчик был актуальным
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const plans = [
    { days: 180, label: '180-day' },
    { days: 90,  label: '90-day'  },
    { days: 30,  label: '30-day'  },
  ].map(p => ({
    ...p,
    deadline: lastStartDate(p.days),
    daysLeft: daysUntil(lastStartDate(p.days)),
  }));

  // Самый срочный план (минимум дней)
  const mostUrgent = plans.reduce((a, b) => a.daysLeft < b.daysLeft ? a : b);

  return (
    <div style={{
      background: 'linear-gradient(90deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
      borderBottom: '1px solid #ef444444',
      fontFamily: "'Chakra Petch', sans-serif",
      overflow: 'hidden',
    }}>
      <div className="deadline-inner">

        {/* Иконка + заголовок */}
        <span style={{
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          ⚠ Final Staking Window
        </span>

        <span style={{ color: '#ffffff44', fontSize: 14, flexShrink: 0 }}>|</span>

        {/* Планы */}
        <div className="deadline-plans">
          {plans.map(p => {
            const urgent = p.daysLeft <= 14;
            const badgeBg    = urgent ? '#fbbf24' : '#ffffff22';
            const badgeColor = urgent ? '#1a0000' : '#ffffff';
            const daysColor  = urgent ? '#fef08a' : '#ffffff';
            return (
              <span key={p.days} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                <span style={{
                  background: badgeBg,
                  borderRadius: 4,
                  padding: '2px 8px',
                  color: badgeColor,
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '.5px',
                }}>
                  {p.label}
                </span>
                <span style={{ color: '#ffcccc' }}>
                  <b style={{ color: '#ffffff' }}>{fmtDate(p.deadline)}</b>
                </span>
                <span style={{
                  background: '#00000033',
                  borderRadius: 4,
                  padding: '1px 7px',
                  color: daysColor,
                  fontWeight: 700,
                  fontSize: 10,
                }}>
                  {p.daysLeft === 0 ? 'CLOSED' : `${p.daysLeft}d`}
                </span>
              </span>
            );
          })}
        </div>

        {/* Крайний срок */}
        <span className="deadline-expire">
          All plans expire Jan 1, 2027
        </span>

      </div>
    </div>
  );
}
