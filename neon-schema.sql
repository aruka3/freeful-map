-- Neon schema for freeful-map
-- Run this in the Neon SQL editor after creating your project

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION NOT NULL DEFAULT 0,
  lng DOUBLE PRECISION NOT NULL DEFAULT 0,
  comment TEXT,
  memo_public TEXT,
  memo_private TEXT,
  has_storefront BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'want_to_visit',
  tags TEXT[] NOT NULL DEFAULT '{}',
  session_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chain_memos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  accommodations TEXT NOT NULL DEFAULT '',
  caveats TEXT,
  confirmed_at TIMESTAMPTZ,
  official_url TEXT,
  memo TEXT,
  session_id TEXT NOT NULL
);
