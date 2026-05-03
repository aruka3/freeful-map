-- Freeful Map: 食事制限対応レストラン地図アプリ
-- Supabase SQL Editor でこのファイルを実行してください

create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- 基本情報
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  comment text,
  -- tags text[] -- 将来のタグ機能用（複数選択）

  -- ステータス
  status text not null default 'want_to_visit'
    check (status in ('want_to_visit', 'visited_safe', 'need_check', 'not_compatible', 'closed')),

  -- 3項目の段階評価
  gluten_free text not null default 'unknown'
    check (gluten_free in ('full', 'partial', 'unknown')),
  casein_free text not null default 'unknown'
    check (casein_free in ('full', 'partial', 'unknown')),
  sugar_free text not null default 'unknown'
    check (sugar_free in ('full', 'partial', 'unknown')),

  -- 確認レベル
  check_level text default 'unchecked'
    check (check_level in ('main_food', 'main_dish', 'seasoning', 'unchecked')),

  -- 記録項目
  foods_ok text,
  foods_ng text,
  confirmed_details text,
  shop_response text,
  changes_made text,
  staff_memo text,
  safety_level int check (safety_level between 1 and 5),
  can_consult_next boolean,
  notes text,

  -- ユーザー識別（MVP: セッションID、将来: Supabase Auth UUID）
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

-- インデックス
create index if not exists restaurants_status_idx on restaurants(status);
create index if not exists restaurants_session_id_idx on restaurants(session_id);

-- RLS (Row Level Security) - 将来のマルチユーザー対応
alter table restaurants enable row level security;

-- 全員が読める
create policy "Anyone can read restaurants"
  on restaurants for select
  using (true);

-- 誰でも登録できる（MVP: 認証なし）
create policy "Anyone can insert restaurants"
  on restaurants for insert
  with check (true);

-- 自分のセッションIDのものだけ更新・削除できる
create policy "Session owner can update"
  on restaurants for update
  using (session_id = current_setting('request.headers', true)::json->>'x-session-id')
  with check (session_id = current_setting('request.headers', true)::json->>'x-session-id');

create policy "Session owner can delete"
  on restaurants for delete
  using (session_id = current_setting('request.headers', true)::json->>'x-session-id');
