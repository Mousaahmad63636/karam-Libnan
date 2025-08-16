# Karam Libnan Website

Modern catalog + comprehensive admin system for Lebanese homemade & canned products. Frontend is static HTML/CSS/JS; dynamic data loaded from Supabase (Postgres + Auth + Storage). Professional admin dashboard provides complete website management.

## 🚀 **STATUS: PRODUCTION READY** ✅

**📋 For New Development Sessions:**
1. **Read First:** [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) - Complete achievement summary
2. **Technical Reference:** [`PROJECT_INDEX.md`](./PROJECT_INDEX.md) - Detailed documentation  
3. **Database:** Fully deployed and operational at Supabase
4. **Admin Panel:** Fully functional with complete CRUD capabilities

## Quick Start

**🌐 Website Access:**
- **Main Site:** Open `index.html` in browser
- **Admin Panel:** Open `admin.html` and login with admin credentials

**🔧 Development:**
```bash
# Serve locally for ES modules
python -m http.server 8000
# Access: http://localhost:8000
```

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS (progressive enhancement)
- **Backend:** Supabase (Postgres, Auth, Storage, RLS)
- **Admin:** Complete dashboard with CRUD operations
- **Database:** Full schema with FTS and security policies

## Project Structure
- `index.html` – Public landing (hero, about, products, contact, pending section)
- `events.html`, `services.html`, `faq.html` – Additional marketing pages
- `admin.html` – Auth + CRUD dashboard (Supabase powered)
- `css/styles.css` – Global styles & UI enhancements
- `js/app.js` – Frontend logic (rendering, filtering, search, i18n toggle, remote fetch)
- `js/supabaseClient.js` – Supabase client initialization (ESM import)
- `supabase-schema.sql` – Database schema, triggers, RLS policies
- `images/`, `fonts/`, `assets/` – Static assets (placeholders)

## Key Features
- Responsive grid (2 columns mobile, 4 desktop) with live search highlighting
- Main category tabs (Single / Bulk) + dynamic subcategory buttons
- Banner per subcategory (driven by DB banners)
- Arabic/English toggle (extendable translation system)
- Floating WhatsApp contact button
- Coming Soon (Pending) section
- Admin authentication & CRUD (products, subcategories, sections)
- Supabase data fetch with graceful fallback to embedded static dataset
- Skeleton loading + accessibility-conscious focus rings

## Supabase Integration
`app.js` attempts remote load if `window.SUPABASE_ANON_KEY` and a helper are present. Otherwise static seed data is used.

Tables (see `supabase-schema.sql`):
- `subcategories` – slugged taxonomy (single/bulk) + banner
- `products` – primary catalog items with FTS (tsvector)
- `sections` – arbitrary CMS sections (hero/about/etc.)
- `media` – metadata for uploaded files (stored in Supabase Storage buckets)
- `audit_logs` – change tracking (extend with triggers)

Row Level Security (RLS):
- Public read: active products/subcategories/sections
- Admin full CRUD via JWT custom claim `role = 'admin'` (set in Supabase Auth user metadata / policies)

## Environment & Runtime Config
Expose the anon key ONLY (not the service role key) to the browser:
```html
<script>
  window.SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY';
  // lightweight factory to satisfy app.js remote fetch expectation
  window.createSupabaseClient = (url, key) => window.supabase.createClient(url, key);
</script>
<script type="module" src="https://esm.sh/@supabase/supabase-js@2"></script>
<script type="module" src="js/app.js" defer></script>
```
Alternatively inject the key via a build step; do not commit secrets.

## Admin Dashboard (`admin.html`)
Capabilities:
- Login (email/password via Supabase Auth)
- List/Create/Update/Delete products
- Manage subcategories (slug, banner, order, active)
- Manage sections (hero/about content + images)

Planned Enhancements:
- Media uploads (Storage) & image picker
- Translation (edit Arabic text fields directly)
- Bulk import/export (CSV/JSON)
- Audit log viewer

## Local Development
1. Open `supabase-schema.sql` in Supabase SQL editor & run (once).
2. Seed additional subcategories & products either manually or via Admin dashboard.
3. Serve locally (for module imports) – example (Python):
```bash
python -m http.server 8000
```
Visit: http://localhost:8000

## Data Fetch Flow
1. `initializeSite()` → `tryRemoteLoad()` → fetch subcategories/products/sections.
2. Fallback to static `productsData` if remote fails.
3. Build subcategory filters & render product cards.

## Adding / Editing Products
Use `admin.html` (preferable). Static fallback array in `app.js` is only a seed; once remote is active you typically remove or minimize it.

## Deploy
1. Host static files (Netlify/Vercel/S3) or Supabase Edge Functions if needed.
2. Set environment injection for `SUPABASE_ANON_KEY` in HTML or script.
3. Configure Auth (create admin user, add custom claim role=admin).
4. Create Storage buckets: `products`, `banners`, `misc`.
5. Update RLS policies if adding anonymous write constraints (e.g., contact forms).

## Security Notes
- Never expose service role key in frontend.
- Enforce tight RLS; test with anon token.
- Validate images (size/type) before upload (future enhancement).

## License & Content
Placeholder content/images—replace with brand-approved assets prior to production.

---

## 📚 **Complete Documentation Available:**

- **[`PROJECT_STATUS.md`](./PROJECT_STATUS.md)** - **READ THIS FIRST** for new Claude sessions
  - Complete achievement summary
  - Current project status  
  - Production readiness checklist
  - Context for continuing development

- **[`PROJECT_INDEX.md`](./PROJECT_INDEX.md)** - Technical reference guide
  - Detailed file structure and purposes
  - Database schema explanations
  - Development workflow guidelines
  - Security considerations

**For any new development work, start by reading PROJECT_STATUS.md to understand what has been accomplished and the current state of the project.**

---
Questions or deployment issues: Check PROJECT_STATUS.md or open admin panel for system diagnostics.
