-- =============================================
-- GETHSTAKE — Supabase Schema
-- Запускать в SQL Editor вашего Supabase проекта
-- =============================================

-- 1. Платформенная статистика (одна строка, id=1)
create table if not exists platform_stats (
  id            int primary key default 1,
  tvl_eth       numeric not null default 0,
  participants  int     not null default 0,
  rewards_paid_eth numeric not null default 0,
  active_validators int  not null default 0,
  updated_at    timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- Вставляем начальные демо-данные
insert into platform_stats (id, tvl_eth, participants, rewards_paid_eth, active_validators)
values (1, 48392, 28492, 3271, 1512)
on conflict (id) do nothing;

-- 2. Пользователи — идентификатор по адресу кошелька
create table if not exists users (
  id             uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  created_at     timestamptz not null default now(),
  last_seen_at   timestamptz not null default now()
);

-- 3. Стейки
create table if not exists stakes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  wallet_address text not null,
  amount_eth     numeric not null check (amount_eth >= 8),
  plan_days      int  not null check (plan_days in (30, 90, 180)),
  apy            numeric not null,
  status         text not null default 'active' check (status in ('active', 'completed', 'withdrawn')),
  started_at     timestamptz not null default now(),
  ends_at        timestamptz not null,
  created_at     timestamptz not null default now()
);

create index if not exists stakes_wallet_idx on stakes(wallet_address);
create index if not exists stakes_status_idx on stakes(status);

-- =============================================
-- RLS (Row Level Security)
-- =============================================

alter table platform_stats enable row level security;
alter table users enable row level security;
alter table stakes enable row level security;

-- platform_stats: публичное чтение
create policy "Platform stats readable by all"
  on platform_stats for select using (true);

-- users: читают и создают через service role (API routes)
create policy "Users managed via service role"
  on users for all using (true) with check (true);

-- stakes: читают и создают через service role (API routes)
create policy "Stakes managed via service role"
  on stakes for all using (true) with check (true);

-- =============================================
-- Функция для обновления статистики платформы
-- =============================================
create or replace function refresh_platform_stats()
returns void language plpgsql as $$
begin
  update platform_stats set
    tvl_eth           = (select coalesce(sum(amount_eth), 0) from stakes where status = 'active'),
    participants      = (select count(distinct wallet_address) from stakes where status = 'active'),
    rewards_paid_eth  = (select coalesce(sum(amount_eth * apy / 100 * plan_days / 365.0), 0) from stakes where status = 'completed'),
    active_validators = (select floor(count(*)::numeric / 4) from stakes where status = 'active'),
    updated_at        = now()
  where id = 1;
end;
$$;
