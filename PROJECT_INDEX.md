# Karam Libnan - Project Index & Structure

## Project Overview
**Type**: Lebanese homemade products catalog website  
**Architecture**: Static HTML/CSS/JS frontend + Supabase backend  
**Stack**: Vanilla HTML/CSS/JS, Supabase (PostgreSQL + Auth + Storage)  
**Pattern**: Progressive enhancement with graceful fallback to static data  

---

## Complete File Structure

### Root Level Files
```
C:\Users\Ahmad\Desktop\Karam Libnan\
├── index.html                 (225 lines) - Main landing page
├── admin.html                 (498 lines) - Admin dashboard with auth & CRUD
├── events.html                - Marketing page for events
├── services.html              - Services information page  
├── faq.html                   - FAQ page
├── favicon.ico                - Site icon
├── README.md                  (105 lines) - Complete documentation
└── supabase-schema.sql        (113 lines) - Database schema & RLS policies
```

### JavaScript Core
```
js/
├── app.js                     (775 lines) - Main frontend logic
│   ├── Navigation toggle & smooth scrolling
│   ├── Product rendering & filtering system
│   ├── Search with live highlighting
│   ├── Arabic/English i18n toggle
│   ├── Supabase integration with fallback data
│   └── WhatsApp contact integration
│
└── supabaseClient.js          (14 lines) - Supabase client initialization
    ├── ESM import from CDN
    ├── Client configuration
    └── Auth persistence setup
```

### Styling
```
css/
└── styles.css                 - Global styles & responsive components
    ├── Responsive grid system (2 col mobile, 4 col desktop)
    ├── Component styles (cards, buttons, navigation)
    ├── Animation & transition definitions
    └── Mobile-first responsive design
```

### Assets & Media
```
images/
├── hero.png                   - Homepage hero image
└── ourstory.png               - About section image

fonts/                         - Empty (uses Google Fonts CDN)
assets/                        - Empty (placeholder directory)
```

### Configuration & Development
```
.vscode/
└── launch.json                - VS Code debugging configuration

.git/                          - Git repository data
```

---

## Database Schema Structure

### Core Tables (supabase-schema.sql)
```sql
subcategories                  - Product taxonomy & categorization
├── slug (PK)                  - URL-friendly identifier
├── category_type              - 'single' or 'bulk' classification
├── title_en/title_ar          - Multi-language titles
├── banner_image_url           - Category banner images
├── sort_order                 - Display ordering
└── active                     - Visibility flag

products                       - Main product catalog
├── id (PK)                    - Auto-increment primary key
├── name_en/name_ar            - Multi-language product names
├── description_en/description_ar - Multi-language descriptions
├── main_type                  - 'single' or 'bulk' classification
├── sub_slug (FK)              - References subcategories.slug
├── image_url                  - Product image URL
├── featured                   - Homepage featured flag
├── active                     - Visibility flag
├── ingredients (JSONB)        - Ingredients array
├── tsv (tsvector)             - Full-text search vector
└── timestamps                 - created_at, updated_at

sections                       - CMS content sections
├── key (PK)                   - Section identifier (hero, about, etc.)
├── title_en/title_ar          - Multi-language titles
├── content_en/content_ar      - Multi-language content
└── image_url                  - Section images

media                          - File metadata
├── id (PK)                    - Auto-increment primary key
├── filename                   - Original filename
├── bucket                     - Supabase storage bucket
├── file_path                  - Storage path
├── file_size                  - File size in bytes
└── timestamps                 - Upload tracking

audit_logs                     - Change tracking
├── id (PK)                    - Auto-increment primary key
├── table_name                 - Modified table
├── operation                  - INSERT/UPDATE/DELETE
├── old_data/new_data (JSONB)  - Change data
└── timestamp                  - When change occurred
```

### Security & Policies
- **Row Level Security (RLS)** enabled on all tables
- **Public read access** for active products/subcategories/sections
- **Admin write access** via JWT custom claim `role = 'admin'`
- **Anon key exposure** safe for frontend (read-only operations)

---

## Frontend Architecture

### Main Entry Point (index.html)
```html
Structure:
├── Header with navigation & search
├── Hero section (dynamic from sections table)
├── About section (dynamic from sections table)  
├── Products catalog with filtering
├── Contact section
└── Footer

Key Features:
├── Responsive navigation with mobile toggle
├── Product search with live highlighting
├── Category/subcategory filtering system
├── Arabic/English language toggle
├── WhatsApp floating contact button
└── Intersection observer animations
```

### Core JavaScript Functions (app.js)
```javascript
Navigation & UI:
├── toggleNav()                - Mobile navigation toggle
├── updateActiveNavLink()      - Smooth scroll nav highlighting
├── toggleLanguage()           - Arabic/English switcher
└── handleSearch()             - Live product search

Data Management:
├── initializeSite()           - Main initialization function
├── tryRemoteLoad()            - Supabase data fetching
├── buildSubcategoryFilters()  - Dynamic filter generation
└── renderProducts()           - Product grid rendering

Product System:
├── filterProducts()           - Category/subcategory filtering
├── highlightSearchTerms()     - Search result highlighting
├── handleProductImageError()  - Graceful image fallback
└── toggleShowMore()           - Product description expansion

Fallback Data:
└── productsData[]             - Static product array (development/fallback)
```

### Admin Dashboard (admin.html)
```html
Features:
├── Supabase authentication system
├── Sidebar navigation (Products, Subcategories, Sections)
├── CRUD operations for all content types
├── Image upload capabilities (planned)
├── Responsive admin interface
└── Real-time data synchronization

Sections:
├── Login/logout functionality
├── Product management (create, read, update, delete)
├── Subcategory management with banner uploads
├── Content section editing (hero, about, etc.)
└── Media management (future enhancement)
```

---

## Data Flow & Integration

### Frontend Data Loading
```
1. initializeSite() called on page load
2. tryRemoteLoad() attempts Supabase connection
3. If successful: fetch subcategories, products, sections from DB
4. If failed: use static productsData[] as fallback
5. buildSubcategoryFilters() generates dynamic filter buttons
6. renderProducts() displays product grid
7. Search and filters update display in real-time
```

### Admin Operations
```
1. User authentication via Supabase Auth
2. JWT token validation with admin role claim
3. CRUD operations through Supabase client
4. Real-time UI updates on data changes
5. Image uploads to Supabase Storage (planned)
6. Audit logging for all modifications
```

### Supabase Configuration
```
URL: https://xbznaxiummganlidnmdd.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (exposed in meta tags)
Auth: Persistent sessions enabled
Storage: Buckets for products, banners, misc
RLS: Enforced on all tables with appropriate policies
```

---

## Key Features & Capabilities

### User-Facing Features
- **Responsive Design**: Mobile-first approach, 2-4 column adaptive grid
- **Product Catalog**: Dynamic filtering by category and subcategory
- **Search Functionality**: Live search with term highlighting
- **Multi-language Support**: Arabic/English toggle with i18n system
- **Contact Integration**: WhatsApp floating button for direct contact
- **Progressive Enhancement**: Works with/without JavaScript

### Technical Features
- **Full-Text Search**: PostgreSQL tsvector for efficient product search
- **Image Optimization**: Graceful fallback for failed image loads
- **Performance**: Skeleton loading states and optimized rendering
- **SEO Optimized**: Meta tags, structured data, accessible markup
- **Security**: RLS policies, input validation, XSS protection

### Admin Features
- **Authentication**: Secure login via Supabase Auth
- **Content Management**: Full CRUD for products, categories, sections
- **Media Management**: Image upload and storage integration
- **Audit Trail**: Complete change tracking and logging
- **Real-time Updates**: Live data synchronization

---

## Development Workflow

### Local Development
```bash
# Serve locally for ES modules
python -m http.server 8000
# Access: http://localhost:8000
```

### Database Setup
```sql
# Run supabase-schema.sql in Supabase SQL editor
# Create admin user with custom claim: role = 'admin'
# Configure Storage buckets: products, banners, misc
```

### Deployment Checklist
- [ ] Set Supabase anon key in environment
- [ ] Configure Auth providers and settings
- [ ] Create Storage buckets with proper policies
- [ ] Set up admin user with role claim
- [ ] Test RLS policies with anon token
- [ ] Deploy static files to hosting platform

---

## Security Considerations

### Frontend Security
- **Anon Key Only**: Service role key never exposed to client
- **Input Validation**: All user inputs validated and sanitized
- **XSS Protection**: Content properly escaped and validated
- **HTTPS Only**: All external resources served over HTTPS

### Backend Security
- **Row Level Security**: All tables protected with RLS policies
- **JWT Validation**: Admin operations require valid role claim
- **Input Sanitization**: All database inputs properly sanitized
- **File Upload Security**: Type and size validation (planned)

---

## Future Enhancements

### Planned Features
- [ ] Media upload interface in admin panel
- [ ] Bulk import/export functionality (CSV/JSON)
- [ ] Advanced search filters and sorting
- [ ] Product reviews and ratings system
- [ ] Email newsletter integration
- [ ] Analytics and reporting dashboard
- [ ] Multi-vendor support
- [ ] Shopping cart functionality (if needed)

### Technical Improvements
- [ ] Image optimization and CDN integration
- [ ] Progressive Web App (PWA) capabilities
- [ ] Advanced caching strategies
- [ ] Performance monitoring and metrics
- [ ] Automated testing suite
- [ ] CI/CD pipeline setup

---

*Generated: `{timestamp}` | Project Location: `C:\Users\Ahmad\Desktop\Karam Libnan`*