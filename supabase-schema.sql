-- Supabase schema for Karam Libnan
-- NOTE: Enable pgcrypto extension for gen_random_uuid if not already
create extension if not exists pgcrypto;

-- CATEGORIES (single/bulk high level if needed) optional; we focus on subcategories with type
create table if not exists subcategories (
  slug text primary key,
  category_type text not null check (category_type in ('single','bulk')),
  title_en text not null,
  title_ar text,
  banner_image_url text,
  sort_order int default 0,
  active boolean default true
);

create table if not exists products (
  id bigserial primary key,
  name_en text not null,
  name_ar text,
  description_en text,
  description_ar text,
  main_type text not null check (main_type in ('single','bulk')),
  sub_slug text references subcategories(slug) on update cascade on delete set null,
  image_url text,
  featured boolean default false,
  active boolean default true,
  ingredients jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on products(main_type, sub_slug);
create index on products(featured) where featured = true;

-- Full text search (English + simple) combine fields
alter table products add column if not exists tsv tsvector;
create index if not exists products_tsv_idx on products using gin(tsv);
create or replace function products_tsv_trigger() returns trigger as $$
begin
  new.tsv := to_tsvector('simple', coalesce(new.name_en,'') || ' ' || coalesce(new.description_en,'') || ' ' || coalesce(new.name_ar,'') || ' ' || coalesce(new.description_ar,''));
  return new;
end;$$ language plpgsql;
create trigger trg_products_tsv before insert or update on products
  for each row execute procedure products_tsv_trigger();

-- Sections (hero/about/pending etc.)
create table if not exists sections (
  key text primary key,
  title_en text,
  title_ar text,
  body_en text,
  body_ar text,
  image_url text,
  updated_at timestamptz default now()
);

-- Media metadata (files stored in Supabase Storage)
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  alt_en text,
  alt_ar text,
  kind text,
  linked_type text,
  linked_id text,
  created_at timestamptz default now()
);

-- Audit logs
create table if not exists audit_logs (
  id bigserial primary key,
  entity text not null,
  entity_id text not null,
  action text not null,
  user_id uuid,
  diff jsonb,
  created_at timestamptz default now()
);

-- RLS Enable
alter table subcategories enable row level security;
alter table products enable row level security;
alter table sections enable row level security;
alter table media enable row level security;
alter table audit_logs enable row level security;

-- Basic Policies (adjust after creating an admin role / JWT claim)
create policy public_read_products on products for select using (active = true);
create policy public_read_subcategories on subcategories for select using (active = true);
create policy public_read_sections on sections for select using (true);

-- Admin policies (expect a custom claim role = 'admin')
create policy admin_all_products on products for all using (auth.jwt() ->> 'role' = 'admin');
create policy admin_all_subcategories on subcategories for all using (auth.jwt() ->> 'role' = 'admin');
create policy admin_all_sections on sections for all using (auth.jwt() ->> 'role' = 'admin');
create policy admin_all_media on media for all using (auth.jwt() ->> 'role' = 'admin');
create policy admin_all_audit on audit_logs for all using (auth.jwt() ->> 'role' = 'admin');

-- Updated at trigger
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;$$ language plpgsql;
create trigger trg_products_updated before update on products for each row execute procedure set_updated_at();
create trigger trg_sections_updated before update on sections for each row execute procedure set_updated_at();

-- Seed a few subcategories (modify as needed)
insert into subcategories(slug, category_type, title_en, sort_order) values
 ('fresh-veges','single','Fresh Veges',1),
 ('fresh-pickles','single','Fresh Pickles',2)
 on conflict do nothing;
