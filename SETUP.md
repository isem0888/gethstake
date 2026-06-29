# GethStake — Setup Guide

## Stack
- **Next.js 14** (App Router) — фронтенд + API routes
- **RainbowKit + wagmi** — подключение кошельков (MetaMask, WalletConnect, Coinbase и др.)
- **Supabase** — база данных (PostgreSQL) + RLS
- **Vercel** — деплой
- **GitHub** — репозиторий

---

## 1. GitHub

```bash
# В терминале PyCharm (Tools → Terminal):
cd D:\gethstake
git init
git add .
git commit -m "init: Next.js + wagmi + supabase"
```

Создай репо на github.com → пуш:
```bash
git remote add origin https://github.com/ВАШ_ЛОГИН/gethstake.git
git branch -M main
git push -u origin main
```

---

## 2. Supabase

1. Зайди на [supabase.com](https://supabase.com) → New project
2. Запомни **Project URL** и **anon key** (Settings → API)
3. Скопируй **Service Role key** (тоже в Settings → API, скрытый)
4. Открой **SQL Editor** → вставь содержимое файла `supabase/schema.sql` → Run

---

## 3. WalletConnect Project ID

1. Зайди на [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Создай проект → скопируй **Project ID**

---

## 4. Локальный запуск

```bash
# Скопируй .env.local.example → .env.local и заполни ключи:
cp .env.local.example .env.local
```

Открой `.env.local` в PyCharm и заполни:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abcd1234...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Затем:
```bash
npm install
npm run dev
```

Открой: **http://localhost:3000**

---

## 5. Vercel деплой

1. Зайди на [vercel.com](https://vercel.com) → New Project → Import из GitHub
2. Выбери репо `gethstake`
3. В разделе **Environment Variables** добавь все 5 переменных из `.env.local`
4. Deploy → получишь URL вида `gethstake.vercel.app`
5. Обнови `NEXT_PUBLIC_SITE_URL` на этот URL

---

## Структура проекта

```
app/
  layout.tsx          — корневой layout с Providers
  page.tsx            — лендинг + дашборд
  globals.css         — все стили
  providers.tsx       — wagmi + RainbowKit провайдеры
  api/
    platform/route.ts — GET: платформенная статистика
    user/route.ts     — POST: upsert пользователя
    stakes/route.ts   — GET/POST: стейки пользователя

components/
  Navbar.tsx          — навигация с мобильным меню
  WalletButton.tsx    — кнопка Connect Wallet (RainbowKit)
  EthLogo.tsx         — SVG логотип Ethereum
  Dashboard.tsx       — дашборд (платформа + личный кабинет)

lib/
  wagmi.ts            — конфиг wagmi/RainbowKit
  supabase.ts         — клиентский Supabase
  supabase-server.ts  — серверный Supabase (service role)
  database.types.ts   — TypeScript типы БД

supabase/
  schema.sql          — SQL: создать таблицы + RLS + seed данные
```

---

## Как работает Connect Wallet

1. Пользователь нажимает кнопку → открывается модальное окно RainbowKit
2. Выбирает кошелёк (MetaMask, WalletConnect QR, Coinbase и др.)
3. После подключения — `WalletButton.tsx` отправляет `POST /api/user` для регистрации в Supabase
4. Дашборд (`Dashboard.tsx`) загружает личную статистику через `GET /api/stakes?wallet=0x...`

---

## Следующие шаги

- [ ] Реальная интеграция со смарт-контрактом для стейкинга
- [ ] Email-нотификации через Supabase Edge Functions
- [ ] Обновление `platform_stats` через cron (Supabase или Vercel Cron)
- [ ] Страница `/dashboard` — отдельный полный экран
- [ ] Подключить реальные данные ETH через Alchemy/Infura API
