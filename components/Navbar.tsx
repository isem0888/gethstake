'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { EthLogo } from './EthLogo';
import { WalletButton } from './WalletButton';

interface NavbarProps {
  lang: 'en' | 'ru';
  onLangChange: (l: 'en' | 'ru') => void;
}

export function Navbar({ lang, onLangChange }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isConnected } = useAccount();

  const links = [
    { href: '/stake',  en: 'Stake',      ru: 'Стейкинг' },
    { href: '#why8',   en: 'Why 8 ETH',  ru: 'Почему 8 ETH' },
    { href: '#stake',  en: 'Calculator', ru: 'Калькулятор' },
    { href: '#market', en: 'Market',     ru: 'Рынок' },
    { href: '#faq',    en: 'FAQ',        ru: 'FAQ' },
  ];

  return (
    <nav>
      <div className="wrap nav-in">
        <a className="logo" href="/" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <span className="dot"><EthLogo size={14} /></span>
          GETHSTAKE
        </a>

        <div className="nav-links">
          {links.map(l => (
            <a key={l.href} href={l.href}>{lang === 'ru' ? l.ru : l.en}</a>
          ))}
        </div>

        <div className="nav-right">
          {isConnected && (
            <a href="/dashboard" className="btn btn-wallet nav-dashboard-btn" style={{ fontSize: 12, padding: '9px 16px', fontFamily: "'Chakra Petch',sans-serif", letterSpacing: '.5px', textTransform: 'uppercase' }}>
              {lang === 'ru' ? 'Кабинет' : 'Dashboard'}
            </a>
          )}
          <div className="lang nav-lang">
            <button className={lang === 'en' ? 'on' : ''} onClick={() => onLangChange('en')}>EN</button>
            <button className={lang === 'ru' ? 'on' : ''} onClick={() => onLangChange('ru')}>RU</button>
          </div>
          <WalletButton />
        </div>

        {/* Mobile burger */}
        <button className="burger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              {lang === 'ru' ? l.ru : l.en}
            </a>
          ))}
          {isConnected && (
            <a href="/dashboard" onClick={() => setMenuOpen(false)} style={{ color: '#60a5fa' }}>
              {lang === 'ru' ? '📊 Кабинет' : '📊 Dashboard'}
            </a>
          )}
          <div className="lang" style={{ marginTop: 12 }}>
            <button className={lang === 'en' ? 'on' : ''} onClick={() => onLangChange('en')}>EN</button>
            <button className={lang === 'ru' ? 'on' : ''} onClick={() => onLangChange('ru')}>RU</button>
          </div>
        </div>
      )}
    </nav>
  );
}
