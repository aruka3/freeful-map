-- Freeful Map: 安心して食べられるお店の地図
-- Supabase SQL Editor でこのファイルを実行してください

create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  comment text,

  status text not null default 'want_to_visit'
    check (status in ('want_to_visit', 'visited')),

  -- ユーザー識別（MVP: sessionId、将来: Supabase Auth UUID）
  session_id text not null
);

-- updated_at 自動更新
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger restaurants_updated_at
  before update on restaurants
  for each row execute function update_updated_at();

create index if not exists restaurants_status_idx on restaurants(status);
create index if not exists restaurants_session_id_idx on restaurants(session_id);

-- RLS（Row Level Security）
alter table restaurants enable row level security;

create policy "Anyone can read restaurants"
  on restaurants for select using (true);

create policy "Anyone can insert restaurants"
  on restaurants for insert with check (true);

create policy "Session owner can update"
  on restaurants for update
  using (session_id = current_setting('request.headers', true)::json->>'x-session-id')
  with check (session_id = current_setting('request.headers', true)::json->>'x-session-id');

create policy "Session owner can delete"
  on restaurants for delete
  using (session_id = current_setting('request.headers', true)::json->>'x-session-id');
