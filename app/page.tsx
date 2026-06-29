'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Navbar } from '@/components/Navbar';
import { EthLogo } from '@/components/EthLogo';
import { Dashboard } from '@/components/Dashboard';
import { StakeModal } from '@/components/StakeModal';
import { HeroNetwork } from '@/components/HeroNetwork';
import { WalletTracker } from '@/components/WalletTracker';

/* ── i18n ── */
const RU: Record<string, string> = {
  hero_eyebrow: 'Стейкинг ETH нового поколения',
  hero_sub: 'gethstake.com объединяет ритейл-участников в валидаторы Ethereum. Узел требует 32 ETH, оборудования и аптайма 24/7 — ваши 8 ETH это четверть валидатора, а доход вы получаете в ETH.',
  hero_cta1: 'Начать стейкинг →', hero_cta2: 'Подробнее →',
  hero_trusted: 'Нам доверяет сообщество',
  sc_tvl: 'Всего застейкано', sc_part: 'Активных участников', sc_apr: 'APR лучшего плана · 90 дней', sc_aprsub: 'в ETH',
  bf_tag: 'Создано для результата', bf_h2: 'Почему выбирают gethstake',
  bf_1h: 'Реальный доход в ETH', bf_1p: 'Конкурентная доходность на базе стейкинга, номинированная и выплачиваемая в ETH — не в баллах.',
  bf_2h: 'Безопасно', bf_2p: 'Проверенные аудитом контракты и институциональная инфраструктура со встроенными лимитами риска.',
  bf_3h: 'Гибкий выход', bf_3p: 'Досрочный вывод возможен — вы получаете депозит обратно, теряя начисленную доходность.',
  bf_4h: 'Пул валидаторов', bf_4p: 'Четыре депозита по 8 ETH формируют один валидатор на 32 ETH — ритейл-доступ к стейкингу Ethereum.',
  w_tag: 'Экономика валидатора', w_h2: 'Почему минимальный депозит — 8 ETH',
  w_p: 'Это не барьер, а математика сети. Стать валидатором в одиночку дорого и сложно.',
  w_h3: 'Один валидатор = 32 ETH',
  w_p1: 'Чтобы запустить собственный узел Ethereum, нужно внести ровно 32 ETH и обеспечить:',
  w_li1: 'надёжное оборудование, работающее 24/7', w_li2: 'стабильное соединение и аптайм',
  w_li3: 'принятие риска слэшинга за простой или ошибки', w_li4: 'техническое сопровождение узла',
  w_p2: 'Для большинства частных инвесторов это недостижимо. gethstake.com снимает барьер: четыре депозита по 8 ETH объединяются в один валидатор на 32 ETH.',
  w_ring: 'Как формируется валидатор', w_you: 'Вы',
  s_tag: 'Планы стейкинга', s_h2: 'Застейкай ETH. Выбери срок.',
  s_p: 'Выберите срок стейкинга. Чем дольше период — тем выше APR. Доходность начисляется и выплачивается в ETH.',
  s_30: 'Лок 30 дней', s_90: 'Лок 90 дней', s_180: 'Лок 180 дней',
  s_min: 'мин. 8 ETH · выплата в ETH',
  s_why: '',
  c_tag: 'Калькулятор', c_h2: 'Посчитайте доход в ETH',
  c_p: 'Выберите сумму (от 8 ETH) и план — увидите начисление в ETH за период и в год.',
  c_amt: 'Сумма депозита', c_hint: 'Минимальный депозит — 8 ETH (¼ валидатора).', c_plan: 'План',
  c_outpre: 'Доход за период', c_dep: 'Депозит', c_apr: 'APR', c_year: 'Доход в год', c_total: 'Итого к выводу',
  m_tag: 'Как работают валидаторы', m_h2: 'Валидация Ethereum — децентрализованно и прозрачно',
  m_p: 'Ethereum использует Proof-of-Stake: валидаторы блокируют ETH и получают вознаграждение за подтверждение транзакций.',
  m_c1: 'ETH требуется на один валидатор', m_c2: 'активных валидаторов в сети',
  m_c3: 'среднее время финализации блока', m_c4: 'средний APR сети (~6%)',
  m_why: 'Валидаторы предлагают и аттестуют новые блоки. Сеть случайным образом выбирает, кто предлагает каждый блок — чем больше валидаторов, тем децентрализованнее Ethereum. Пул-стейкинг позволяет участвовать без запуска собственного узла.',
  t_tag: 'Безопасность и прозрачность', t_h2: 'Не доверие, а проверяемость',
  t_1h: 'Резервный фонд', t_1p: 'Часть прибыли идёт в страховой буфер, сглаживающий выплаты в слабые периоды.',
  t_2h: 'Прозрачный учёт', t_2p: 'Отчётность по объединению депозитов в валидаторы и по фактической доходности.',
  t_3h: 'Лимиты риска', t_3p: 'Ограничения по стратегиям, плечу и операциям зашиты в правила платформы.',
  pr_1h: 'Кастоди и кошельки', pr_1p: 'MPC-инфраструктура для некастодиального хранения и подписи.',
  pr_2h: 'Стейкинг-движок', pr_2p: 'Институциональный стейкинг и управление валидаторами.',
  pr_3h: 'Аудит контрактов', pr_3p: 'Независимый аудит смарт-контрактов и инфраструктуры.',
  f_h2: 'Частые вопросы',
  f_q1: 'Почему минимальный депозит — 8 ETH?', f_a1: 'Полноценный валидатор Ethereum требует 32 ETH. Платформа объединяет четырёх участников по 8 ETH в один валидатор.',
  f_q2: 'В чём начисляется доходность?', f_a2: 'Все планы номинированы и выплачиваются в ETH — независимо от курса к доллару.',
  f_q3: 'Как формируется доход валидатора?', f_a3: 'Валидаторы Ethereum получают вознаграждение за аттестацию блоков, приоритетные комиссии из транзакций и MEV-доход. gethstake распределяет этот совокупный доход между участниками пула пропорционально их доле.',
  f_q4: 'Когда начисляется доходность?', f_a4: 'Доходность начисляется ежедневно с момента формирования валидатора. Выплата производится в ETH по истечении срока лока.',
  f_q5: 'Что происходит после окончания срока лока?', f_a5: 'По истечении срока депозит и начисленный доход автоматически становятся доступны для вывода на ваш кошелёк.',
  f_q6: 'Можно ли вывести раньше срока?', f_a6: 'Да, досрочный вывод возможен — но инвестор теряет начисленную доходность. Депозит возвращается в полном объёме.',
  f_q7: 'Сколько времени занимает вывод средств?', f_a7: 'Вывод обрабатывается в течение 1–5 рабочих дней в зависимости от очереди выхода валидатора в сети Ethereum.',
  f_q8: 'Какие кошельки поддерживаются?', f_a8: 'Поддерживаются MetaMask, Trust Wallet, Coinbase Wallet и любые WalletConnect-совместимые кошельки.',
  f_q9: 'Есть ли максимальный размер депозита?', f_a9: 'Один план соответствует одной позиции в валидаторе (8 ETH). Вы можете открыть несколько планов одновременно — ограничений на общую сумму нет.',
  f_q10: 'Можно ли открыть несколько стейков одновременно?', f_a10: 'Да. Вы можете держать несколько активных планов с разными сроками и суммами — каждый обрабатывается независимо.',
  f_q11: 'Нужна ли верификация (KYC)?', f_a11: 'На текущем этапе верификация не требуется. Для участия достаточно подключить кошелёк Ethereum.',
  f_q12: 'Какова комиссия платформы?', f_a12: 'Платформа взимает комиссию с дохода валидатора. APR в таблице планов уже указан после вычета комиссии — вы видите итоговую ставку.',
  f_q13: 'Как защищены средства от слэшинга?', f_a13: 'Используется профессиональная инфраструктура с несколькими уровнями защиты от двойной подписи. Резервный фонд платформы покрывает потенциальные штрафы сети.',
  f_q14: 'Как выбирается валидатор для предложения блока?', f_a14: 'Ethereum случайным образом выбирает валидатора через алгоритм RANDAO — чем больше ETH в стейкинге, тем чаще валидатор получает право предложить блок.',
  f_q15: 'Как платформа обеспечивает аптайм валидаторов?', f_a15: 'Узлы работают на институциональной инфраструктуре Everstake с резервными серверами и мониторингом 24/7. Штрафы за простой минимальны при аптайме выше 98%.',
  cta_h2: 'Войди в будущее стейкинга ETH', cta_p: 'Застейкай от 8 ETH сегодня и стань частью валидации Ethereum.',
  cta_ph: 'Введите email', cta_btn: 'Начать →',
  disc: '',
};

function t(key: string, lang: 'en' | 'ru', fallback: string) {
  return lang === 'ru' ? (RU[key] ?? fallback) : fallback;
}

/* ── Bonus APR by deposit size + plan duration ── */
function getBonus(eth: number, days: number): number {
  if (eth >= 128) return days === 30 ? 1.1 : days === 90 ? 2.0 : 2.2;
  if (eth >= 96)  return days === 30 ? 1.0 : days === 90 ? 1.7 : 1.8;
  if (eth >= 64)  return days === 30 ? 0.8 : days === 90 ? 1.5 : 1.5;
  if (eth >= 32)  return days === 30 ? 0.4 : days === 90 ? 0.5 : 1.0;
  return 0;
}

/* ── Calculator hook ── */
const APR_MAP: Record<number, number> = { 30: 5.5, 90: 8.3, 180: 9.7 };
function useCalc() {
  const [amount, setAmountRaw] = useState(8);
  const [inputVal, setInputValRaw] = useState('8');
  const [days, setDays] = useState(90);
  const baseApr = APR_MAP[days];
  const bonus = getBonus(amount, days);
  const apr = baseApr + bonus;

  const dailyGain    = amount * apr / 100 / 365;
  const monthlyGain  = dailyGain * 30;
  const quarterGain  = dailyGain * 90;
  const yearGain     = dailyGain * 365;
  const periodGain   = dailyGain * days;

  const setAmount = (n: number) => {
    setAmountRaw(n);
    setInputValRaw(String(n));
  };
  const handleInputChange = (v: string) => {
    setInputValRaw(v);
    const n = parseFloat(v);
    if (!isNaN(n) && n > 0) setAmountRaw(n);
  };
  const handleInputBlur = () => {
    const n = Math.max(8, Math.min(128, parseFloat(inputVal) || 8));
    setAmountRaw(n);
    setInputValRaw(String(n));
  };

  return { amount, setAmount, inputVal, handleInputChange, handleInputBlur, days, setDays, baseApr, bonus, apr, dailyGain, monthlyGain, quarterGain, yearGain, periodGain, total: amount + periodGain };
}

/* ── Particle canvas ── */
function ParticleBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0, raf = 0;
    const COUNT = 70, MAX = 160, COLOR = '155,253,78';
    type P = { x: number; y: number; vx: number; vy: number; r: number; pulse: number };
    let pts: P[] = [];
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const init = () => {
      resize();
      pts = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
        r: Math.random() * 1.6 + .6, pulse: Math.random() * Math.PI * 2,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${COLOR},${(1 - d / MAX) * .22})`;
            ctx.lineWidth = .8;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.pulse += .018;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const a = .6 + Math.sin(p.pulse) * .4;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLOR},${a})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} id="bg-canvas" />;
}

/* ── Bonus tooltip ── */
function BonusTooltip({ lang }: { lang: 'en' | 'ru' }) {
  const [open, setOpen] = useState(false);
  const text = lang === 'ru'
    ? 'Каждые 32 ETH формируют полноценный валидатор Ethereum. Полный узел активнее участвует в предложении блоков и получает приоритетные комиссии (MEV + tips). Чем больше валидаторов вы контролируете — тем выше доля в общем пуле наград. Платформа распределяет этот дополнительный доход как бонус к базовому APR.'
    : 'Every 32 ETH forms a complete Ethereum validator. A full node participates more actively in block proposals and earns priority fees (MEV + tips). The more validators you control, the larger your share of the reward pool. The platform distributes this extra income as a bonus on top of the base APR.';
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(v => !v)}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', border: '1px solid #5a6480', color: '#5a6480', fontSize: 10, fontWeight: 700, cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}
      >?</span>
      {open && (
        <span style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', width: 240, background: '#0d1f0f', border: '1px solid #2a3f2c', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#b8ccba', lineHeight: 1.55, zIndex: 50, pointerEvents: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.5)' }}>
          {text}
          <span style={{ position: 'absolute', bottom: -5, left: '50%', width: 8, height: 8, background: '#0d1f0f', border: '1px solid #2a3f2c', borderRight: 'none', borderTop: 'none', transform: 'translateX(-50%) rotate(-45deg)' }} />
        </span>
      )}
    </span>
  );
}

/* ── SVG helpers ── */
const EthSvg = ({ w = 22 }: { w?: number }) => (
  <svg viewBox="0 0 28 44" fill="none" width={w}>
    <polygon points="14,0 0,22 14,16" fill="#60a5fa" opacity=".75" />
    <polygon points="14,0 28,22 14,16" fill="#60a5fa" />
    <polygon points="0,25 14,44 14,31" fill="#60a5fa" opacity=".75" />
    <polygon points="28,25 14,44 14,31" fill="#60a5fa" />
    <polygon points="0,22 14,16 14,31 0,25" fill="#60a5fa" opacity=".45" />
    <polygon points="28,22 14,16 14,31 28,25" fill="#60a5fa" opacity=".65" />
  </svg>
);

interface PlatformStats { tvl_eth: number; participants: number; active_validators: number; rewards_paid_eth: number; }

function fmtStat(n: number, decimals = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/* ── PAGE ── */
export default function Home() {
  const [lang, setLang] = useState<'en' | 'ru'>('en');
  const [ps, setPs] = useState<PlatformStats>({ tvl_eth: 227936, participants: 28492, active_validators: 7123, rewards_paid_eth: 5733.15 });
  const [showModal, setShowModal] = useState(false);
  const calc = useCalc();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const handleStartStaking = () => {
    if (!isConnected) {
      openConnectModal?.();
    } else {
      setShowModal(true);
    }
  };

  useEffect(() => {
    fetch('/api/platform').then(r => r.json()).then(d => {
      if (d && d.tvl_eth) setPs(d);
    }).catch(() => {});
  }, []);

  const fmt = (n: number, d = 4) =>
    n.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  const chipLabel = (d: number, apr: number) =>
    `${d}${lang === 'ru' ? 'д' : 'd'} · ${apr}%`;

  return (
    <>
      <WalletTracker />
      <ParticleBg />
      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── Dashboard (public stats + personal) ── */}
      <div className="dashboard-root">
        <div className="wrap">
          <Dashboard />
        </div>
      </div>

      {/* ── HERO ── */}
      <header className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">
                <span className="dotg" />
                {t('hero_eyebrow', lang, 'Next-generation ETH staking')}
              </div>
              <h1 className="hero-h1">
                {lang === 'ru' ? <>Стейкай.<br />Зарабатывай.<br /><span className="g">Владей<br />валидатором.</span></> : <>Stake.<br />Earn.<br /><span className="g">Own a<br />validator.</span></>}
              </h1>
              <p className="sub">{t('hero_sub', lang, 'gethstake.com pools retail participants into Ethereum validators. A full node needs 32 ETH, hardware and 24/7 uptime — your 8 ETH is a quarter of a validator, and you earn yield in ETH.')}</p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#stake">{t('hero_cta1', lang, 'Stake now →')}</a>
                <a className="btn btn-ghost" href="#why8">{t('hero_cta2', lang, 'Explore →')}</a>
              </div>
              <div className="trusted">{t('hero_trusted', lang, 'Trusted by the community')}</div>
              <div className="avatars">
                <div className="av" /><div className="av" /><div className="av" /><div className="av" />
                <span className="more">+12K</span>
              </div>
            </div>
            <div className="hero-right">
              <HeroNetwork />
              {[
                { lbl: t('sc_tvl', lang, 'Total value locked'), val: `${fmtStat(ps.tvl_eth)} ETH`, chg: `${fmtStat(ps.participants, 0)} ${lang === 'ru' ? 'участников' : 'participants'}`, pts: '0,30 12,26 24,28 36,18 48,20 60,10 72,12 84,4' },
                { lbl: t('sc_part', lang, 'Active participants'), val: fmtStat(ps.participants, 0), chg: `${fmtStat(ps.active_validators, 0)} ${lang === 'ru' ? 'валидаторов' : 'validators'}`, pts: '0,28 12,24 24,26 36,20 48,14 60,16 72,8 84,6' },
                { lbl: t('sc_apr', lang, 'Best plan APR'), val: '9.7%', chg: t('sc_aprsub', lang, 'in ETH'), pts: '0,26 12,22 24,24 36,16 48,18 60,12 72,10 84,6' },
              ].map(s => (
                <div key={s.lbl} className="stat-card">
                  <div>
                    <div className="lbl">{s.lbl}</div>
                    <div className="val">{s.val}</div>
                    <div className="chg">{s.chg}</div>
                  </div>
                  <svg className="spark" viewBox="0 0 84 38">
                    <polyline fill="none" stroke="#60a5fa" strokeWidth="2" points={s.pts} />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          <div className="powered">
            <span className="pl">Powered by</span>
            <span className="slot" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg viewBox="0 0 22 22" width={22} height={22} style={{ borderRadius: '50%', flexShrink: 0 }}><rect width="22" height="22" rx="11" fill="#0d2580"/><text x="11" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial,sans-serif">Z</text></svg>
              Zodia Custody
            </span>
            <span className="slot" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <img src="https://github.com/MetaMask.png?size=22" width={22} height={22} style={{ borderRadius: '50%', objectFit: 'cover' }} alt="MetaMask" />
              <img src="https://github.com/trustwallet.png?size=22" width={22} height={22} style={{ borderRadius: '50%', objectFit: 'cover' }} alt="Trust Wallet" />
              MetaMask · Trust Wallet
            </span>
            <span className="slot" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <img src="https://github.com/hknio.png?size=22" width={22} height={22} style={{ borderRadius: '50%', objectFit: 'cover' }} alt="Hacken" onError={(e) => { e.currentTarget.src = 'https://avatars.githubusercontent.com/u/34027067?s=22'; }} />
              Hacken
            </span>
            <span className="slot" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <img src="https://github.com/pyth-network.png?size=22" width={22} height={22} style={{ borderRadius: '50%', objectFit: 'cover' }} alt="Pyth" />
              <img src="https://github.com/smartcontractkit.png?size=22" width={22} height={22} style={{ borderRadius: '50%', objectFit: 'cover' }} alt="Chainlink" />
              Pyth · Chainlink
            </span>
          </div>
        </div>
      </header>

      {/* ── FEATURES ── */}
      <section id="features">
        <div className="wrap">
          <div className="sec-head">
            <div className="tag">{t('bf_tag', lang, 'Built for performance')}</div>
            <h2>{t('bf_h2', lang, 'Why participants choose gethstake')}</h2>
          </div>
          <div className="feat">
            {[
              { icon: <EthSvg w={26} />, h: t('bf_1h', lang, 'Real ETH yield'), p: t('bf_1p', lang, 'Competitive staking-based returns, denominated and paid in ETH — not in points.') },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L4 6v5.5c0 5.1 3.4 9.8 8 11.5 4.6-1.7 8-6.4 8-11.5V6L12 2z"/><path d="M9 12l2 2 4-4"/></svg>, h: t('bf_2h', lang, 'Secure'), p: t('bf_2p', lang, 'Audited contracts and institutional-grade infrastructure with built-in risk limits.') },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M14 6l6 6-6 6"/><path d="M3 6v12"/></svg>, h: t('bf_3h', lang, 'Flexible exit'), p: t('bf_3p', lang, 'Early withdrawal available — you get your principal back, forfeiting accrued yield.') },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" strokeDasharray="2 3"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/></svg>, h: t('bf_4h', lang, 'Pooled validators'), p: t('bf_4p', lang, 'Four 8 ETH deposits form one 32 ETH validator — retail access to Ethereum staking.') },
            ].map(f => (
              <div key={f.h} className="fcard">
                <div className="fic">{f.icon}</div>
                <h3>{f.h}</h3>
                <p>{f.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY 8 ETH ── */}
      <section id="why8" style={{ background: 'var(--bg2)' }}>
        <div className="wrap">
          <div className="sec-head center">
            <div className="tag">{t('w_tag', lang, 'Validator economics')}</div>
            <h2>{t('w_h2', lang, 'Why the minimum deposit is 8 ETH')}</h2>
            <p>{t('w_p', lang, "It isn't a paywall — it's the network's math. Becoming a solo validator is expensive and complex.")}</p>
          </div>
          <div className="panel">
            <div className="vbox">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <EthLogo size={32} />
                  <h3 style={{ fontFamily: "'Chakra Petch',sans-serif", textTransform: 'uppercase', fontSize: 22 }}>
                    {t('w_h3', lang, 'One validator = 32 ETH')}
                  </h3>
                </div>
                <p>{t('w_p1', lang, 'To run your own Ethereum node you must deposit exactly 32 ETH and provide:')}</p>
                <ul>
                  {[
                    t('w_li1', lang, 'reliable hardware running 24/7'),
                    t('w_li2', lang, 'a stable connection and high uptime'),
                    t('w_li3', lang, 'acceptance of slashing risk for downtime or errors'),
                    t('w_li4', lang, 'ongoing technical maintenance of the node'),
                  ].map(li => <li key={li}>{li}</li>)}
                </ul>
                <p style={{ marginTop: 16 }}>{t('w_p2', lang, 'For most private investors that is out of reach. gethstake.com removes the barrier: four deposits of 8 ETH combine into one 32 ETH validator.')}</p>
              </div>
              <div className="vsplit">
                <div className="ringl">{t('w_ring', lang, 'How a validator is formed')}</div>
                <div className="quarters">
                  <div className="q you"><span>{t('w_you', lang, 'You')}</span><br />8</div>
                  <div className="q">8</div><div className="q">8</div><div className="q">8</div>
                </div>
                <div className="veq">
                  <b>8 ETH × 4 = 32 ETH</b> → 1 Ethereum validator.{' '}
                  {lang === 'ru' ? 'Ваша доля — ' : 'Your share is '}<b>{lang === 'ru' ? '¼ валидатора' : '¼ of a validator'}</b>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── NODE OWNERSHIP ── */}
      <section id="nodes" style={{ background: 'var(--bg2)' }}>
        <div className="wrap">
          <div className="sec-head center">
            <div className="tag">{lang === 'ru' ? 'Программа бонусов узла' : 'Node Bonus Program'}</div>
            <h2>{lang === 'ru' ? 'Четыре статуса. Четыре уровня дохода.' : 'Four tiers. Four levels of yield.'}</h2>
            <p>{lang === 'ru'
              ? 'Чем больше валидаторов вы контролируете — тем выше ваш статус и бонус к APR. Каждые 32 ETH дают вам полный контроль над одним узлом и дополнительный доход за вклад в децентрализацию сети.'
              : 'The more validators you control, the higher your status and APR bonus. Every 32 ETH gives you full control of one node and extra yield for contributing to network decentralization.'
            }</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginTop: 8 }}>
            {([
              {
                eth: 32, bonusRange: '+0.4%–1.0%', pct: 25, name: 'Validator', nameRu: 'Валидатор',
                icon: (
                  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    <circle cx="19" cy="19" r="18" stroke="#60a5fa" strokeWidth="1.2" strokeOpacity=".4"/>
                    <path d="M19 8L11 14v7c0 5 3.4 7.8 8 9 4.6-1.2 8-4 8-9v-7L19 8z" stroke="#60a5fa" strokeWidth="1.5" fill="none"/>
                    <path d="M15 19l3 3 5-5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                descEn: 'One full Ethereum validator. Your node proposes and attests blocks, earning base staking rewards plus a +0.4% to +1.0% bonus depending on your chosen lock period.',
                descRu: 'Один полный валидатор Ethereum. Узел предлагает и аттестует блоки, получая базовое вознаграждение плюс +0.4%–1.0% бонус в зависимости от срока блокировки.',
                highlight: false,
              },
              {
                eth: 64, bonusRange: '+0.8%–1.5%', pct: 50, name: 'Sentinel', nameRu: 'Страж',
                icon: (
                  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    <circle cx="19" cy="19" r="18" stroke="#60a5fa" strokeWidth="1.2" strokeOpacity=".4"/>
                    <path d="M12 19a7 7 0 1 0 14 0 7 7 0 0 0-14 0z" stroke="#60a5fa" strokeWidth="1.5" fill="none"/>
                    <circle cx="19" cy="19" r="3" fill="#60a5fa" fillOpacity=".7"/>
                    <path d="M19 10v3M19 26v3M10 19h3M26 19h3" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                ),
                descEn: 'Two full validators under your control. Double attestation rewards and a +0.8% to +1.5% APR bonus that scales with your lock period.',
                descRu: 'Два полных валидатора под управлением. Двойные аттестации и бонус +0.8%–1.5% к APR в зависимости от срока.',
                highlight: false,
              },
              {
                eth: 96, bonusRange: '+1.0%–1.8%', pct: 75, name: 'Architect', nameRu: 'Архитектор',
                icon: (
                  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    <circle cx="19" cy="19" r="18" stroke="#60a5fa" strokeWidth="1.2" strokeOpacity=".4"/>
                    <polygon points="19,9 27,14 27,24 19,29 11,24 11,14" stroke="#60a5fa" strokeWidth="1.5" fill="none"/>
                    <polygon points="19,14 23,16.5 23,21.5 19,24 15,21.5 15,16.5" stroke="#60a5fa" strokeWidth="1" fill="none" strokeOpacity=".5"/>
                  </svg>
                ),
                descEn: 'Three-node cluster operator. Your validator trio strengthens finality and MEV distribution, earning a +1.0% to +1.8% APR bonus tied to your commitment period.',
                descRu: 'Оператор кластера из трёх узлов. Трио влияет на скорость финализации и MEV, принося +1.0%–1.8% к APR в зависимости от срока блокировки.',
                highlight: false,
              },
              {
                eth: 128, bonusRange: '+1.1%–2.2%', pct: 100, name: 'Sovereign', nameRu: 'Суверен',
                icon: (
                  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    <circle cx="19" cy="19" r="18" stroke="#60a5fa" strokeWidth="1.4"/>
                    <path d="M11 15l8-6 8 6v8l-8 6-8-6v-8z" stroke="#60a5fa" strokeWidth="1.5" fill="none"/>
                    <path d="M15 19l2.5 2.5L23 16" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="19" cy="10" r="1.5" fill="#60a5fa"/>
                    <circle cx="27" cy="15" r="1.5" fill="#60a5fa"/>
                    <circle cx="27" cy="23" r="1.5" fill="#60a5fa"/>
                    <circle cx="11" cy="15" r="1.5" fill="#60a5fa"/>
                    <circle cx="11" cy="23" r="1.5" fill="#60a5fa"/>
                  </svg>
                ),
                descEn: 'Maximum tier. Four full validators, maximum decentralization impact. Earn the highest +1.1% to +2.2% APR bonus — the pinnacle of participation on the gethstake platform.',
                descRu: 'Максимальный тир. Четыре полных валидатора, максимальный вклад в децентрализацию. Наивысший бонус +1.1%–2.2% к APR — высшая форма участия на платформе.',
                highlight: true,
              },
            ] as const).map(tier => (
              <div key={tier.eth} className="fcard" style={{ position: 'relative', border: tier.highlight ? '1px solid var(--acc)' : '1px solid #1d2c1f', textAlign: 'center', padding: '32px 24px 24px' }}>
                {tier.highlight && (
                  <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--acc)', color: '#040e24', fontSize: 10, fontWeight: 700, fontFamily: "'Chakra Petch',sans-serif", padding: '3px 14px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                    {lang === 'ru' ? 'МАКСИМАЛЬНЫЙ ТИР' : 'MAXIMUM TIER'}
                  </span>
                )}

                {/* Icon */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>{tier.icon}</div>

                {/* APR badge */}
                <div style={{ display: 'inline-block', background: 'rgba(96,165,250,.12)', border: '1px solid rgba(96,165,250,.3)', borderRadius: 20, padding: '4px 14px', marginBottom: 12 }}>
                  <span style={{ color: '#60a5fa', fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 13 }}>{tier.bonusRange} APR bonus</span>
                </div>

                {/* Name */}
                <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                  {lang === 'ru' ? tier.nameRu : tier.name}
                </div>
                <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 13, color: 'var(--acc)', marginBottom: 16 }}>
                  {tier.eth} ETH · {tier.eth / 32} {lang === 'ru' ? (tier.eth / 32 === 1 ? 'валидатор' : 'валидатора') : (tier.eth / 32 === 1 ? 'validator' : 'validators')}
                </div>

                {/* Description */}
                <p style={{ fontSize: 13, color: 'var(--mut)', lineHeight: 1.6, margin: 0 }}>
                  {lang === 'ru' ? tier.descRu : tier.descEn}
                </p>

                {/* Progress bar */}
                <div style={{ background: 'var(--bg)', borderRadius: 6, height: 4, marginTop: 20 }}>
                  <div style={{ width: `${tier.pct}%`, height: '100%', borderRadius: 6, background: 'linear-gradient(90deg, #60a5fa, #a78bfa)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STAKE + CALCULATOR (combined) ── */}
      <section id="stake">
        <div className="wrap">
          <div className="sec-head center">
            <div className="tag">{t('s_tag', lang, 'Staking plans')}</div>
            <h2>{t('s_h2', lang, 'Stake your ETH. Pick a term.')}</h2>
            <p>{t('s_p', lang, 'Choose your staking term. Each plan earns yield in ETH — the longer the period, the higher the APR.')}</p>
          </div>

          <div className="panel">
            {/* ── Plan selector ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
              {([
                { days: 30,  apr: 5.5,  label: t('s_30',  lang, '30-day lock'),  hot: false },
                { days: 90,  apr: 8.3,  label: t('s_90',  lang, '90-day lock'),  hot: true  },
                { days: 180, apr: 9.7,  label: t('s_180', lang, '180-day lock'), hot: false },
              ] as const).map(p => {
                const active = calc.days === p.days;
                return (
                  <div
                    key={p.days}
                    onClick={() => calc.setDays(p.days)}
                    style={{
                      background: active ? 'rgba(96,165,250,.12)' : 'var(--card2)',
                      border: `1px solid ${active ? 'var(--acc)' : p.hot ? 'rgba(96,165,250,.35)' : 'var(--line)'}`,
                      borderRadius: 12,
                      padding: '12px 10px',
                      cursor: 'pointer',
                      transition: '.18s',
                      textAlign: 'center',
                      position: 'relative',
                      boxShadow: active ? '0 0 16px rgba(96,165,250,.15)' : 'none',
                    }}
                  >
                    {p.hot && !active && (
                      <span style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', background: 'var(--acc)', color: '#040e24', fontSize: 8, fontWeight: 700, fontFamily: "'Chakra Petch',sans-serif", padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap', letterSpacing: '.5px' }}>
                        {lang === 'ru' ? 'ПОПУЛЯРНЫЙ' : 'POPULAR'}
                      </span>
                    )}
                    <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 22, fontWeight: 700, color: active ? 'var(--acc)' : 'var(--txt)', lineHeight: 1.1 }}>
                      {p.apr}%
                    </div>
                    <div style={{ fontSize: 10, color: active ? 'var(--acc)' : 'var(--mut)', fontFamily: "'Chakra Petch',sans-serif", textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>
                      APR
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: active ? 'var(--txt)' : 'var(--mut)', marginBottom: 1 }}>{p.label}</div>
                    {active && (
                      <div style={{ fontSize: 9, color: 'var(--acc)', fontFamily: "'Chakra Petch',sans-serif", letterSpacing: '.5px', marginTop: 4 }}>
                        ✓ {lang === 'ru' ? 'ВЫБРАН' : 'SELECTED'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Deposit + Calculator ── */}
            <div className="calc">
              <div>
                <label style={{ fontSize: 11 }}>{t('c_amt', lang, 'Deposit amount')}</label>
                <div className="input-eth">
                  <input type="number" value={calc.inputVal} min={8} step={1}
                    onChange={e => calc.handleInputChange(e.target.value)}
                    onBlur={calc.handleInputBlur} />
                  <span className="tk">ETH</span>
                </div>
                <div className="hint" style={{ fontSize: 11, marginTop: 6 }}>{t('c_hint', lang, 'Minimum deposit — 8 ETH (¼ of a validator).')}</div>
                <button
                  onClick={handleStartStaking}
                  style={{ width: '100%', marginTop: 14, background: 'var(--acc)', color: '#040e24', border: 'none', borderRadius: 10, padding: '12px 0', fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '.5px', cursor: 'pointer', textTransform: 'uppercase' }}
                >
                  {lang === 'ru'
                    ? (isConnected ? 'Запустить стейкинг →' : 'Подключить кошелёк →')
                    : (isConnected ? 'Start Staking →' : 'Connect Wallet →')}
                </button>
              </div>

              <div className="calc-out">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 2 }}>
                  <div className="muted" style={{ fontSize: 11, fontFamily: "'Chakra Petch',sans-serif", textTransform: 'uppercase', letterSpacing: '.8px' }}>
                    {lang === 'ru' ? `Доход за ${calc.days} дней` : `Yield for ${calc.days} days`}
                  </div>
                  {calc.bonus > 0 && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(96,165,250,.12)', border: '1px solid rgba(96,165,250,.3)', borderRadius: 5, padding: '2px 8px' }}>
                      <span style={{ color: '#60a5fa', fontSize: 10, fontWeight: 700 }}>+{calc.bonus}% {lang === 'ru' ? 'бонус' : 'bonus'}</span>
                      <BonusTooltip lang={lang} />
                    </div>
                  )}
                </div>
                <div className="big" style={{ marginBottom: 2, fontSize: 32 }}>{fmt(calc.periodGain)} ETH</div>
                <div className="row" style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #1d2c1f' }}>
                  <span style={{ color: '#5a6480', fontSize: 12 }}>APR</span>
                  <b style={{ color: calc.bonus > 0 ? '#60a5fa' : undefined, fontSize: 13 }}>
                    {calc.bonus > 0 ? `${calc.baseApr}% + ${calc.bonus}% = ${calc.apr.toFixed(1)}%` : `${calc.apr}%`}
                  </b>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 10 }}>
                  {[
                    { l: lang === 'ru' ? 'В день' : 'Per day',        v: fmt(calc.dailyGain, 6) },
                    { l: lang === 'ru' ? 'В месяц' : 'Per month',     v: fmt(calc.monthlyGain, 4) },
                    { l: lang === 'ru' ? 'За квартал' : 'Per quarter', v: fmt(calc.quarterGain, 4) },
                    { l: lang === 'ru' ? 'В год' : 'Per year',        v: fmt(calc.yearGain, 4) },
                  ].map(r => (
                    <div key={r.l} style={{ background: 'rgba(96,165,250,.04)', border: '1px solid #1d2c1f', borderRadius: 7, padding: '7px 10px' }}>
                      <div style={{ fontSize: 10, color: '#5a6480', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '.5px' }}>{r.l}</div>
                      <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 13, fontWeight: 700, color: '#60a5fa' }}>{r.v} <span style={{ fontSize: 9, color: '#3d5040', fontWeight: 400 }}>ETH</span></div>
                    </div>
                  ))}
                </div>
                {[
                  { l: lang === 'ru' ? 'Депозит' : 'Deposit', v: `${fmt(calc.amount, calc.amount % 1 === 0 ? 0 : 4)} ETH`, accent: false },
                  { l: lang === 'ru' ? `Доход за ${calc.days} дней` : `Yield (${calc.days}d)`, v: `+${fmt(calc.periodGain)} ETH`, accent: true },
                  { l: lang === 'ru' ? 'Итого к выводу' : 'Total payout', v: `${fmt(calc.total)} ETH`, accent: false, bold: true },
                ].map(r => (
                  <div key={r.l} className="row" style={{ borderColor: r.bold ? 'transparent' : undefined, paddingTop: r.bold ? 8 : undefined }}>
                    <span style={{ color: r.bold ? '#e8eaf8' : '#5a6480', fontWeight: r.bold ? 600 : undefined, fontSize: r.bold ? 13 : 12 }}>{r.l}</span>
                    <b style={{ color: r.accent ? '#60a5fa' : r.bold ? '#fff' : undefined, fontSize: r.bold ? 14 : 13 }}>{r.v}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARKET ── */}
      <section id="market">
        <div className="wrap">
          <div className="sec-head center">
            <div className="tag">{t('m_tag', lang, 'How validators work')}</div>
            <h2>{t('m_h2', lang, 'Ethereum validation — decentralized and transparent')}</h2>
            <p>{t('m_p', lang, 'Ethereum uses Proof-of-Stake: validators lock ETH and earn rewards for confirming transactions.')}</p>
          </div>
          <div className="mkt">
            {[
              { mn: '32 ETH', ml: t('m_c1', lang, 'required per validator') },
              { mn: '500K+', ml: t('m_c2', lang, 'active validators worldwide') },
              { mn: '~12s', ml: t('m_c3', lang, 'block finalization time') },
              { mn: '~6%', ml: t('m_c4', lang, 'average network APR') },
            ].map(m => (
              <div key={m.mn} className="mcard"><div className="mn">{m.mn}</div><div className="ml">{m.ml}</div></div>
            ))}
          </div>
          <p className="why" style={{ textAlign: 'center', margin: '26px auto 0' }}>
            {t('m_why', lang, 'Validators propose and attest to new blocks. The network randomly selects who proposes each block — the more validators, the more decentralized Ethereum becomes. Pooled staking lets anyone participate without running a full node.')}
          </p>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section id="trust" style={{ background: 'var(--bg2)' }}>
        <div className="wrap">
          <div className="sec-head center">
            <div className="tag">{t('t_tag', lang, 'Security & transparency')}</div>
            <h2>{t('t_h2', lang, 'Not trust — verifiability')}</h2>
          </div>
          {[
            [
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L4 6v5.5c0 5.1 3.4 9.8 8 11.5 4.6-1.7 8-6.4 8-11.5V6L12 2z"/><path d="M9 12l2 2 4-4"/></svg>,
                h: t('t_1h', lang, 'Reserve fund'),
                p: t('t_1p', lang, 'Part of the profit goes into an insurance buffer that smooths payouts in weak periods.'),
                addr: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
              },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>, h: t('t_2h', lang, 'Transparent accounting'), p: t('t_2p', lang, 'Reporting on how deposits combine into validators and on actual yield.') },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2.5"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1.2" fill="#60a5fa" stroke="none"/></svg>, h: t('t_3h', lang, 'Risk limits'), p: t('t_3p', lang, 'Limits on strategies, leverage and permitted operations are built into platform rules.') },
            ],
            [
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="15" r="4"/><path d="M12 11.6L20 4"/><path d="M17 4l3 3"/><path d="M19 8l-2.5-2.5"/></svg>, h: t('pr_1h', lang, 'Custody partner'), p: t('pr_1p', lang, 'MPC infrastructure for non-custodial storage and signing.'), pwr: <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center' }}><svg viewBox="0 0 22 22" width={22} height={22} style={{ borderRadius: '50%', flexShrink: 0 }}><rect width="22" height="22" rx="11" fill="#0d2580"/><text x="11" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial,sans-serif">Z</text></svg><span>Zodia Custody</span></div> },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2.5"/><circle cx="4.5" cy="6" r="2"/><circle cx="19.5" cy="6" r="2"/><circle cx="4.5" cy="18" r="2"/><circle cx="19.5" cy="18" r="2"/><path d="M6.2 7.2l4 3.6M17.8 7.2l-4 3.6M6.2 16.8l4-3.6M17.8 16.8l-4-3.6"/></svg>, h: t('pr_2h', lang, 'Wallets'), p: t('pr_2p', lang, 'Non-custodial wallet infrastructure for secure key management.'), pwr: <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center' }}><img src="https://github.com/MetaMask.png?size=22" width={22} height={22} style={{ borderRadius: '50%' }} alt="MetaMask" /><img src="https://github.com/trustwallet.png?size=22" width={22} height={22} style={{ borderRadius: '50%' }} alt="Trust Wallet" /><span>MetaMask · Trust Wallet</span></div> },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/><path d="M8 10.5l1.8 1.8 3-3"/></svg>, h: t('pr_3h', lang, 'Contract audit'), p: t('pr_3p', lang, 'Independent audit of smart contracts and infrastructure.'), pwr: <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center' }}><img src="https://github.com/hknio.png?size=22" width={22} height={22} style={{ borderRadius: '50%' }} alt="Hacken" onError={(e) => { e.currentTarget.src='https://avatars.githubusercontent.com/u/34027067?s=22'; }} /><span>Hacken</span></div> },
            ],
          ].map((row, ri) => (
            <div key={ri} className="trust" style={ri > 0 ? { marginTop: 16 } : {}}>
              {row.map((c: any) => (
                <div key={c.h} className="tcard">
                  <div className="ic">{c.icon}</div>
                  <h3>{c.h}</h3><p>{c.p}</p>
                  {c.addr && (
                    <a
                      href={`https://arkm.com/explorer/address/${c.addr}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="reserve-addr"
                      title={c.addr}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: .7 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {c.addr.slice(0, 8)}…{c.addr.slice(-6)}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: .55 }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  )}
                  {c.pwr && <div className="pwr">{c.pwr}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq">
        <div className="wrap">
          <div className="sec-head center"><div className="tag">FAQ</div><h2>{t('f_h2', lang, 'Frequently asked questions')}</h2></div>
          <div className="faq-wrap">
            {[
              { q: t('f_q1', lang, 'Why is the minimum deposit 8 ETH?'), a: t('f_a1', lang, 'A full Ethereum validator requires 32 ETH. The platform pools four 8 ETH participants into one validator, so 8 ETH is your quarter of the network\'s minimum threshold.') },
              { q: t('f_q2', lang, 'What is the yield paid in?'), a: t('f_a2', lang, 'All plans are denominated and paid in ETH — regardless of the USD exchange rate.') },
              { q: t('f_q3', lang, 'How is validator yield generated?'), a: t('f_a3', lang, 'Ethereum validators earn block attestation rewards, priority fees from transactions, and MEV income. gethstake distributes this combined yield among pool participants proportionally to their stake.') },
              { q: t('f_q4', lang, 'When is yield accrued?'), a: t('f_a4', lang, 'Yield accrues daily from the moment the validator is formed. Payout is made in ETH at the end of the lock period.') },
              { q: t('f_q5', lang, 'What happens when my lock period ends?'), a: t('f_a5', lang, 'Once the term expires, your deposit and accrued yield automatically become available for withdrawal to your wallet.') },
              { q: t('f_q6', lang, 'Can I withdraw before the term ends?'), a: t('f_a6', lang, 'Yes, early withdrawal is available — but you forfeit the accrued yield. Your full principal is returned.') },
              { q: t('f_q7', lang, 'How long does withdrawal take?'), a: t('f_a7', lang, 'Withdrawals are processed within 1–5 business days depending on the Ethereum validator exit queue.') },
              { q: t('f_q8', lang, 'Which wallets are supported?'), a: t('f_a8', lang, 'MetaMask, Trust Wallet, Coinbase Wallet, and any WalletConnect-compatible wallet are supported.') },
              { q: t('f_q9', lang, 'Is there a maximum deposit?'), a: t('f_a9', lang, 'One plan corresponds to one validator position (8 ETH). You can open multiple plans simultaneously — there is no cap on total staked amount.') },
              { q: t('f_q10', lang, 'Can I stake multiple times simultaneously?'), a: t('f_a10', lang, 'Yes. You can hold multiple active plans with different terms and amounts — each is processed independently.') },
              { q: t('f_q11', lang, 'Is KYC required?'), a: t('f_a11', lang, 'At this stage, no verification is required. Connecting an Ethereum wallet is sufficient to participate.') },
              { q: t('f_q12', lang, 'What fees does the platform charge?'), a: t('f_a12', lang, 'The platform takes a fee from validator income. The APR shown in the plan table is already net of fees — you see the final rate.') },
              { q: t('f_q13', lang, 'How are funds protected from slashing?'), a: t('f_a13', lang, 'The platform uses professional infrastructure with multiple layers of protection against double-signing. The reserve fund covers potential network penalties.') },
              { q: t('f_q14', lang, 'How is a block proposer selected?'), a: t('f_a14', lang, 'Ethereum randomly selects a validator via the RANDAO algorithm — the more ETH staked, the more often a validator earns the right to propose a block.') },
              { q: t('f_q15', lang, 'How does the platform ensure validator uptime?'), a: t('f_a15', lang, 'Nodes run on institutional infrastructure with redundant servers and 24/7 monitoring. Inactivity penalties are minimal at uptime above 98%.') },
            ].map((f, i) => (
              <details key={i} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section>
        <div className="wrap">
          <div className="cta-band">
            <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <EthLogo size={40} />
              <div>
                <h2>{t('cta_h2', lang, 'Join the future of ETH staking')}</h2>
                <p>{t('cta_p', lang, 'Stake from 8 ETH today and take part in Ethereum validation.')}</p>
              </div>
            </div>
            <div className="cta-form">
              <a className="btn btn-primary" href="#stake">{t('cta_btn', lang, 'Get started →')}</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="wrap">
          <div className="foot-in">
            <div className="logo">
              <span className="dot"><EthLogo size={14} /></span>
              GETHSTAKE
            </div>
            <div className="socials">
              <a href="#" aria-label="X">𝕏</a>
              <a href="#" aria-label="Telegram">✈</a>
              <a href="#" aria-label="Discord">◇</a>
              <a href="#" aria-label="Docs">▤</a>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
            <a href="/privacy" style={{ fontSize: 12, color: 'var(--mut2)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--acc)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--mut2)')}>
              Privacy Policy
            </a>
            <a href="/terms" style={{ fontSize: 12, color: 'var(--mut2)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--acc)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--mut2)')}>
              Terms of Use
            </a>
            <a href="/crypto-terms" style={{ fontSize: 12, color: 'var(--mut2)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--acc)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--mut2)')}>
              Cryptocurrency Terms
            </a>
          </div>
        </div>
      </footer>

      {showModal && (
        <StakeModal
          amount={calc.amount}
          days={calc.days}
          apr={calc.apr}
          periodGain={calc.periodGain}
          total={calc.total}
          lang={lang}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
