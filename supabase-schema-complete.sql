-- Complete Karam Libnan Database Schema & Seed Data
-- Run this in Supabase SQL Editor

-- Enable extensions
create extension if not exists pgcrypto;

-- SUBCATEGORIES TABLE
create table if not exists subcategories (
  slug text primary key,
  category_type text not null check (category_type in ('single','bulk')),
  title_en text not null,
  title_ar text,
  banner_image_url text,
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PRODUCTS TABLE
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

-- SECTIONS TABLE
create table if not exists sections (
  key text primary key,
  title_en text,
  title_ar text,
  content_en text,
  content_ar text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MEDIA TABLE
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  file_name text,
  file_size bigint,
  mime_type text,
  alt_en text,
  alt_ar text,
  linked_type text,
  linked_id text,
  created_at timestamptz default now()
);

-- AUDIT LOGS TABLE
create table if not exists audit_logs (
  id bigserial primary key,
  table_name text not null,
  record_id text not null,
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  user_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz default now()
);

-- INDEXES
create index if not exists idx_products_main_type on products(main_type);
create index if not exists idx_products_sub_slug on products(sub_slug);
create index if not exists idx_products_featured on products(featured) where featured = true;
create index if not exists idx_products_active on products(active) where active = true;
create index if not exists idx_subcategories_type on subcategories(category_type);
create index if not exists idx_subcategories_active on subcategories(active) where active = true;

-- FULL TEXT SEARCH
alter table products add column if not exists tsv tsvector;
create index if not exists products_tsv_idx on products using gin(tsv);

create or replace function products_tsv_trigger() returns trigger as $$
begin
  new.tsv := to_tsvector('simple', 
    coalesce(new.name_en,'') || ' ' || 
    coalesce(new.description_en,'') || ' ' || 
    coalesce(new.name_ar,'') || ' ' || 
    coalesce(new.description_ar,'')
  );
  return new;
end;$$ language plpgsql;

drop trigger if exists trg_products_tsv on products;
create trigger trg_products_tsv before insert or update on products
  for each row execute procedure products_tsv_trigger();

-- UPDATED AT TRIGGERS
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;$$ language plpgsql;

drop trigger if exists trg_products_updated on products;
drop trigger if exists trg_sections_updated on sections;
drop trigger if exists trg_subcategories_updated on subcategories;

create trigger trg_products_updated before update on products 
  for each row execute procedure set_updated_at();
create trigger trg_sections_updated before update on sections 
  for each row execute procedure set_updated_at();
create trigger trg_subcategories_updated before update on subcategories 
  for each row execute procedure set_updated_at();

-- ROW LEVEL SECURITY
alter table subcategories enable row level security;
alter table products enable row level security;
alter table sections enable row level security;
alter table media enable row level security;
alter table audit_logs enable row level security;

-- DROP EXISTING POLICIES
drop policy if exists public_read_products on products;
drop policy if exists public_read_subcategories on subcategories;
drop policy if exists public_read_sections on sections;
drop policy if exists admin_all_products on products;
drop policy if exists admin_all_subcategories on subcategories;
drop policy if exists admin_all_sections on sections;
drop policy if exists admin_all_media on media;
drop policy if exists admin_all_audit on audit_logs;

-- PUBLIC READ POLICIES
create policy public_read_products on products 
  for select using (active = true);
create policy public_read_subcategories on subcategories 
  for select using (active = true);
create policy public_read_sections on sections 
  for select using (true);

-- ADMIN POLICIES (requires JWT custom claim: role = 'admin')
create policy admin_all_products on products 
  for all using (auth.jwt() ->> 'role' = 'admin');
create policy admin_all_subcategories on subcategories 
  for all using (auth.jwt() ->> 'role' = 'admin');
create policy admin_all_sections on sections 
  for all using (auth.jwt() ->> 'role' = 'admin');
create policy admin_all_media on media 
  for all using (auth.jwt() ->> 'role' = 'admin');
create policy admin_all_audit on audit_logs 
  for all using (auth.jwt() ->> 'role' = 'admin');

-- ==================== SEED DATA ====================

-- CLEAR EXISTING DATA
delete from products;
delete from subcategories;
delete from sections;

-- SINGLE SERVE SUBCATEGORIES
insert into subcategories(slug, category_type, title_en, title_ar, sort_order, active) values
('all', 'single', 'All Products', 'جميع المنتجات', 0, true),
('fresh-veges', 'single', 'Fresh Vegetables', 'خضار طازجة', 1, true),
('fresh-pickles', 'single', 'Fresh Pickles', 'مخللات طازجة', 2, true),
('ordinary-pickles', 'single', 'Ordinary Pickles', 'مخللات عادية', 3, true),
('olives', 'single', 'Olives', 'زيتون', 4, true),
('olive-oil', 'single', 'Olive Oil', 'زيت زيتون', 5, true),
('labne-kishik', 'single', 'Labne & Kishik', 'لبنة وكشك', 6, true),
('pastes', 'single', 'Pastes', 'معاجين', 7, true),
('molases', 'single', 'Molasses', 'دبس', 8, true),
('hydrosols', 'single', 'Hydrosols', 'ماء ورد وزهر', 9, true),
('natural-syrups', 'single', 'Natural Syrups', 'شراب طبيعي', 10, true),
('tahhene', 'single', 'Tahhene', 'طحينة', 11, true),
('vinegar', 'single', 'Vinegar', 'خل', 12, true),
('herbal', 'single', 'Herbal', 'أعشاب', 13, true),
('kamar-el-din', 'single', 'Kamar El Din', 'قمر الدين', 14, true),
('ready-to-serve', 'single', 'Ready to Serve', 'جاهز للتقديم', 15, true)
on conflict (slug) do update set 
  title_en = excluded.title_en,
  title_ar = excluded.title_ar,
  sort_order = excluded.sort_order,
  updated_at = now();

-- BULK SUBCATEGORIES  
insert into subcategories(slug, category_type, title_en, title_ar, sort_order, active) values
('all-bulk', 'bulk', 'All Bulk Products', 'جميع المنتجات بالجملة', 0, true),
('fresh-veges-bulk', 'bulk', 'Fresh Vegetables', 'خضار طازجة', 1, true),
('fresh-pickles-bulk', 'bulk', 'Fresh Pickles', 'مخللات طازجة', 2, true),
('ordinary-pickles-bulk', 'bulk', 'Ordinary Pickles', 'مخللات عادية', 3, true),
('olives-bulk', 'bulk', 'Olives', 'زيتون', 4, true),
('olive-oil-bulk', 'bulk', 'Olive Oil', 'زيت زيتون', 5, true),
('sunflower-oil-bulk', 'bulk', 'Sunflower Oil', 'زيت دوار الشمس', 6, true),
('kishik-bulk', 'bulk', 'Kishik', 'كشك', 7, true),
('pastes-bulk', 'bulk', 'Pastes', 'معاجين', 8, true),
('molases-bulk', 'bulk', 'Molasses', 'دبس', 9, true),
('hydrosols-bulk', 'bulk', 'Hydrosols', 'ماء ورد وزهر', 10, true),
('tahhene-bulk', 'bulk', 'Tahhene', 'طحينة', 11, true),
('vinegar-bulk', 'bulk', 'Vinegar', 'خل', 12, true),
('herbal-bulk', 'bulk', 'Herbal', 'أعشاب', 13, true),
('kamar-el-din-bulk', 'bulk', 'Kamar El Din', 'قمر الدين', 14, true)
on conflict (slug) do update set 
  title_en = excluded.title_en,
  title_ar = excluded.title_ar,
  sort_order = excluded.sort_order,
  updated_at = now();

-- WEBSITE SECTIONS
insert into sections(key, title_en, title_ar, content_en, content_ar) values
('hero', 'Welcome to Karam Libnan', 'أهلاً بكم في كرم لبنان', 
 'Authentic Homemade & Canned Lebanese Products. Crafted with passion, tradition, and the richness of Lebanon''s natural bounty.',
 'منتجات لبنانية أصيلة محضرة في المنزل ومعلبة. مصنوعة بشغف وتقليد وثراء خيرات لبنان الطبيعية.'),
 
('about', 'Our Story', 'قصتنا',
 'Karam Libnan was born from a love for authentic Lebanese flavors passed down through generations. We specialize in homemade and lovingly canned goods that reflect the heart of our land—olive groves, sun-kissed orchards, and mountain herbs.',
 'ولدت كرم لبنان من حب النكهات اللبنانية الأصيلة المتوارثة عبر الأجيال. نحن متخصصون في المنتجات المنزلية والمعلبة بعناية التي تعكس قلب أرضنا—بساتين الزيتون والبساتين المشمسة وأعشاب الجبال.'),

('contact', 'Contact Us', 'اتصل بنا',
 'Get in touch with us for inquiries about our products or to place an order.',
 'تواصل معنا للاستفسار عن منتجاتنا أو لتقديم طلب.')
on conflict (key) do update set 
  title_en = excluded.title_en,
  title_ar = excluded.title_ar,
  content_en = excluded.content_en,
  content_ar = excluded.content_ar,
  updated_at = now();

-- SAMPLE PRODUCTS
insert into products(name_en, name_ar, description_en, description_ar, main_type, sub_slug, featured, active, ingredients) values
('Homemade Fig Jam', 'مربى التين المنزلي', 'Rich, slow-cooked fig jam with subtle sweetness.', 'مربى التين الغني المطبوخ ببطء بحلاوة خفيفة.', 'single', 'pastes', true, true, '["Figs", "Organic Cane Sugar", "Lemon Juice"]'),
('Pickled Cucumbers', 'خيار مخلل', 'Crisp and tangy traditional Lebanese pickles.', 'مخللات لبنانية تقليدية مقرمشة وحامضة.', 'single', 'ordinary-pickles', true, true, '["Cucumbers", "Vinegar", "Sea Salt", "Garlic", "Dill"]'),
('Herbal Thyme Blend (Za''atar)', 'خلطة الزعتر العشبية', 'Fragrant mountain thyme mix, perfect with olive oil & bread.', 'خلطة زعتر جبلي عطر، مثالي مع زيت الزيتون والخبز.', 'single', 'herbal', true, true, '["Thyme", "Sesame Seeds", "Sumac", "Salt"]'),
('Extra Virgin Olive Oil 250ml', 'زيت زيتون بكر ممتاز 250مل', 'Cold-pressed early harvest extra virgin olive oil.', 'زيت زيتون بكر ممتاز مضغوط على البارد من الحصاد المبكر.', 'single', 'olive-oil', false, true, '["Cold-pressed Olives"]'),
('Bulk Fresh Cucumbers 5kg', 'خيار طازج بالجملة 5كغ', 'Fresh cucumbers packed for food service.', 'خيار طازج معبأ للخدمات الغذائية.', 'bulk', 'fresh-veges-bulk', false, true, '["Fresh Cucumbers"]')
on conflict do nothing;

-- CONFIRM DATA
select 'Subcategories created' as status, count(*) as count from subcategories;
select 'Products created' as status, count(*) as count from products;
select 'Sections created' as status, count(*) as count from sections;

-- SUCCESS MESSAGE
select 'Database setup completed successfully!' as message;
