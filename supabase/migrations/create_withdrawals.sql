-- Таблица запросов на вывод средств
create table if not exists withdrawals (
  id            uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  stake_id      uuid references stakes(id) on delete set null,
  amount_eth    numeric(18,8) not null,
  to_address    text not null,
  early         boolean not null default false,
  status        text not null default 'pending', -- pending | processing | completed
  requested_at  timestamptz not null default now(),
  processed_at  timestamptz
);

-- RLS
alter table withdrawals enable row level security;

create policy "Users can read own withdrawals"
  on withdrawals for select
  using (wallet_address = lower(current_setting('request.jwt.claims', true)::json->>'sub'));

create policy "Service role can insert withdrawals"
  on withdrawals for insert
  with check (true);
