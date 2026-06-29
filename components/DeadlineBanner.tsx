// Server component — вычисляет даты на сервере, нет гидрации
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
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '7px 24px',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px 20px',
      }}>

        {/* Иконка + заголовок */}
        <span style={{
          color: '#fca5a5',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          ⚠ Final Staking Window
        </span>

        <span style={{ color: '#7f1d1d', fontSize: 14 }}>|</span>

        {/* Планы */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {plans.map(p => {
            const urgent  = p.daysLeft <= 14;
            const warning = p.daysLeft <= 60;
            const color   = urgent ? '#fbbf24' : warning ? '#fca5a5' : '#fecaca';
            return (
              <span key={p.days} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
              }}>
                <span style={{
                  background: urgent ? '#fbbf2422' : '#ffffff10',
                  border: `1px solid ${urgent ? '#fbbf2455' : '#ffffff15'}`,
                  borderRadius: 4,
                  padding: '1px 7px',
                  color,
                  fontWeight: 700,
                  letterSpacing: '.4px',
                }}>
                  {p.label}
                </span>
                <span style={{ color: '#fca5a5' }}>
                  last start{' '}
                  <b style={{ color }}>{fmtDate(p.deadline)}</b>
                  <span style={{ color: '#f87171', marginLeft: 5 }}>
                    ({p.daysLeft === 0 ? 'CLOSED' : `${p.daysLeft}d left`})
                  </span>
                </span>
              </span>
            );
          })}
        </div>

        {/* Крайний срок */}
        <span style={{
          marginLeft: 'auto',
          color: '#f87171',
          fontSize: 10,
          whiteSpace: 'nowrap',
          opacity: 0.7,
        }}>
          All plans expire Jan 1, 2027
        </span>

      </div>
    </div>
  );
}
