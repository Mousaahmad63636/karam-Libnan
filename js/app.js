/* =============================
   Karam Libnan - Main JS
   Handles: navigation toggle, smooth active link highlighting, product rendering & filtering, simple form validation, intersection animations.
   ============================= */

// Fallback image (shown if external image fails to load)
const FALLBACK_IMAGE = 'https://placehold.co/400x300?text=Image+Unavailable';

// Extended product dataset with mainType (single/bulk) and subcategory mapping
const productsData = [];

// Configurable subcategory lists
const SUBCATS = {
  single: ['all','fresh veges','fresh pickles','ordinary pickles','olives','olive oil','labne & kishik','pastes','molases','hydrosols','natural syrubs','tahhene','vinegar','herbal','kamar el din','ready to serve'],
  bulk: ['all','fresh veges','fresh pickles','ordinary pickles','olives','olive oil','sunflower oil','kishik','pastes','molases','hydrosols','tahhene','vinegar','herbal','kamar el din']
};

// Simple banner images per subcategory (placeholder mapping)
const BANNERS = {
  default: 'images/hero.png',
  'fresh veges': 'images/hero.png',
  'fresh pickles': 'images/hero.png',
  'ordinary pickles': 'images/hero.png',
  'olives': 'images/hero.png',
  'olive oil': 'images/hero.png',
  'labne & kishik': 'images/hero.png',
  'pastes': 'images/hero.png',
  'molases': 'images/hero.png',
  'hydrosols': 'images/hero.png',
  'natural syrubs': 'images/hero.png',
  'tahhene': 'images/hero.png',
  'vinegar': 'images/hero.png',
  'herbal': 'images/hero.png',
  'kamar el din': 'images/hero.png',
  'ready to serve': 'images/hero.png',
  'sunflower oil': 'images/hero.png',
  'kishik': 'images/hero.png'
};

// ----- Overrides Loading (Admin Support) -----
let SITE_OVERRIDES = null;
function loadOverrides() {
  try {
    const raw = localStorage.getItem('siteOverrides');
    if (!raw) return;
    SITE_OVERRIDES = JSON.parse(raw);
    if (SITE_OVERRIDES.products && Array.isArray(SITE_OVERRIDES.products)) {
      productsData.length = 0; // mutate in place
      SITE_OVERRIDES.products.forEach(p => productsData.push(p));
    }
    if (SITE_OVERRIDES.subcats) {
      if (SITE_OVERRIDES.subcats.single) SUBCATS.single = SITE_OVERRIDES.subcats.single;
      if (SITE_OVERRIDES.subcats.bulk) SUBCATS.bulk = SITE_OVERRIDES.subcats.bulk;
    }
    if (SITE_OVERRIDES.banners) {
      Object.assign(BANNERS, SITE_OVERRIDES.banners);
    }
  } catch (e) {
    console.warn('Failed loading overrides', e);
  }
}

function applyContentOverrides() {
  if (!SITE_OVERRIDES) return;
  // Hero
  if (SITE_OVERRIDES.hero) {
    const heroTitle = document.querySelector('.hero h1');
    const heroLead = document.querySelector('.hero .lead, .hero p');
    if (SITE_OVERRIDES.hero.title && heroTitle) heroTitle.textContent = SITE_OVERRIDES.hero.title;
    if (SITE_OVERRIDES.hero.lead && heroLead) heroLead.textContent = SITE_OVERRIDES.hero.lead;
    if (SITE_OVERRIDES.hero.image) {
      const heroSection = document.querySelector('.hero');
      if (heroSection) heroSection.style.backgroundImage = `var(--gradient-hero), url('${SITE_OVERRIDES.hero.image}')`;
    }
  }
  // About
  if (SITE_OVERRIDES.about) {
    if (SITE_OVERRIDES.about.heading) {
      const aboutHeading = document.querySelector('#aboutHeading');
      if (aboutHeading) aboutHeading.textContent = SITE_OVERRIDES.about.heading;
    }
    if (SITE_OVERRIDES.about.text && Array.isArray(SITE_OVERRIDES.about.text)) {
      const aboutSection = document.querySelector('#about .container > div:first-child');
      if (aboutSection) {
        // Replace first two <p>
        const ps = aboutSection.querySelectorAll('p');
        SITE_OVERRIDES.about.text.forEach((t,i)=>{ if (ps[i]) ps[i].textContent = t; });
      }
    }
    if (SITE_OVERRIDES.about.image) {
      const img = document.querySelector('.about-image-wrapper img');
      if (img) img.src = SITE_OVERRIDES.about.image;
    }
  }
}

// Navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navList.classList.toggle('open');
});

// Close nav on link click (mobile)
navList?.addEventListener('click', e => {
  if (e.target.matches('a')) {
    navList.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// Active link highlighting on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-list a');
function onScroll() {
  const scrollPos = window.scrollY + 120; // offset for header
  sections.forEach(sec => {
    if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-list a[href="#${sec.id}"]`);
      active?.classList.add('active');
    }
  });
}
window.addEventListener('scroll', onScroll);

// Inject featured products
function renderFeatured() {
  const container = document.getElementById('featuredProducts');
  if (!container) return;
  const featured = productsData.filter(p => p.featured);
  container.innerHTML = featured.map(p => cardTemplate(p, true)).join('');
}

// Inject bestsellers products
function renderBestsellers() {
  const container = document.getElementById('bestsellersProducts');
  if (!container) return;
  const bestsellers = productsData.filter(p => p.sections?.includes('bestsellers'));
  if (bestsellers.length > 0) {
    container.innerHTML = bestsellers.map(p => cardTemplate(p)).join('');
    document.querySelector('.bestsellers').style.display = 'block';
  }
}

// Inject new arrivals products
function renderNewArrivals() {
  const container = document.getElementById('newArrivalsProducts');
  if (!container) return;
  const newArrivals = productsData.filter(p => p.sections?.includes('new-arrivals'));
  if (newArrivals.length > 0) {
    container.innerHTML = newArrivals.map(p => cardTemplate(p)).join('');
    document.querySelector('.new-arrivals').style.display = 'block';
  }
}

// Inject seasonal products
function renderSeasonal() {
  const container = document.getElementById('seasonalProducts');
  if (!container) return;
  const seasonal = productsData.filter(p => p.sections?.includes('seasonal'));
  if (seasonal.length > 0) {
    container.innerHTML = seasonal.map(p => cardTemplate(p)).join('');
    document.querySelector('.seasonal').style.display = 'block';
  }
}

// Render custom sections dynamically
function renderCustomSections() {
  // Get all unique section keys from products (excluding core sections)
  const coreSection = ['featured', 'bestsellers', 'new-arrivals', 'seasonal', 'hero', 'about', 'contact'];
  
  const customSections = [...new Set(
    productsData.flatMap(p => p.sections || [])
      .filter(section => !coreSection.includes(section))
  )];

  customSections.forEach(sectionKey => {
    const products = productsData.filter(p => p.sections?.includes(sectionKey));
    if (products.length === 0) return;

    // Look up section title from database sections
    let sectionTitle = sectionKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (window.sectionsData) {
      const sectionData = window.sectionsData.find(s => s.key === sectionKey);
      if (sectionData && sectionData.title_en) {
        sectionTitle = sectionData.title_en;
      }
    }

    // Create section if it doesn't exist (use key as ID, title as display)
    let section = document.querySelector(`[data-section="${sectionKey}"]`);
    if (!section) {
      section = createCustomSection(sectionKey, sectionTitle);
    }

    // Populate with products
    const container = section.querySelector('.grid');
    if (container) {
      container.innerHTML = products.map(p => cardTemplate(p)).join('');
      section.style.display = 'block';
    }
  });
}

// Create HTML structure for custom section
function createCustomSection(sectionKey, sectionTitle) {
  const displayTitle = sectionTitle || sectionKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  const section = document.createElement('section');
  section.className = 'custom-section section-padding';
  section.dataset.section = sectionKey;
  section.style.display = 'none';
  section.innerHTML = `
    <div class="container">
      <h2 class="section-title">${displayTitle}</h2>
      <div class="grid cards-3">
        <!-- Products will be injected here -->
      </div>
    </div>
  `;

  // Insert after products section
  const productsSection = document.getElementById('products');
  if (productsSection) {
    productsSection.insertAdjacentElement('afterend', section);
  }

  return section;
}

// Product card template
function cardTemplate(item, isFeatured = false) {
  const searchTerm = (document.getElementById('productSearch')?.value || '').trim();
  const name = highlight(item.name, searchTerm);
  const desc = highlight(item.description, searchTerm);
  return `<article class="card fade-in" data-category="${item.category}" data-sub="${item.sub}" data-main="${item.mainType}">
    ${isFeatured ? '<span class="badge">Featured</span>' : ''}
    <img src="${item.image}" alt="${item.name} image" loading="lazy" data-original="${item.image}" />
    <div class="card-body">
      <h3 class="card-title">${name}</h3>
      <p class="desc">${desc}</p>
      <div class="ingredients"><strong>Ingredients:</strong> ${item.ingredients.join(', ')}</div>
      <span class="category-tag">${item.sub}</span>
    </div>
  </article>`;
}

// Render all products
let currentMain = 'single';
let currentSub = 'all';
function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const searchTerm = (document.getElementById('productSearch')?.value || '').trim().toLowerCase();
  const items = productsData.filter(p => p.mainType === currentMain && (currentSub === 'all' || p.sub === currentSub) && (!searchTerm || p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm)));
  // Optional skeleton effect (quick, not async) for perceived performance
  grid.innerHTML = items.map(()=>'<div class="card skeleton" style="height:260px;border-radius:10px;"></div>').join('');
  setTimeout(()=>{ grid.innerHTML = items.map(p => cardTemplate(p)).join(''); attachImageFallbacks(); observeFadeIns(); }, 80);
  updateBanner();
}

function updateBanner() {
  const banner = document.getElementById('categoryBanner');
  if (!banner) return;
  const key = currentSub === 'all' ? 'default' : currentSub;
  banner.style.backgroundImage = `url('${BANNERS[key] || BANNERS.default}')`;
  banner.innerHTML = `<span>${capitalizeWords(currentSub === 'all' ? currentMain + ' products' : currentSub)}</span>`;
  banner.setAttribute('aria-hidden','false');
}

function capitalizeWords(str) { return str.replace(/\b\w/g, c => c.toUpperCase()); }

function buildSubFilters() {
  const singleWrap = document.getElementById('subFiltersSingle');
  const bulkWrap = document.getElementById('subFiltersBulk');
  if (!singleWrap || !bulkWrap) return;
  singleWrap.innerHTML = SUBCATS.single.map((c,i)=>`<button class="filter-btn${i===0?' active':''}" data-sub="${c}" data-main="single">${capitalizeWords(c)}</button>`).join('');
  bulkWrap.innerHTML = SUBCATS.bulk.map((c,i)=>`<button class="filter-btn${i===0?' active':''}" data-sub="${c}" data-main="bulk">${capitalizeWords(c)}</button>`).join('');
  // Attach listeners
  [singleWrap, bulkWrap].forEach(wrap => wrap.addEventListener('click', e => {
    if (e.target.matches('.filter-btn')) {
      wrap.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      e.target.classList.add('active');
      currentSub = e.target.dataset.sub;
      renderProducts();
    }
  }));
}

function initMainTabs() {
  document.querySelectorAll('.main-cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.main === currentMain) return;
      document.querySelectorAll('.main-cat-tab').forEach(b=>{b.classList.remove('active'); b.setAttribute('aria-selected','false');});
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      currentMain = btn.dataset.main;
      currentSub = 'all';
      document.getElementById('subFiltersSingle').classList.toggle('hidden', currentMain!=='single');
      document.getElementById('subFiltersBulk').classList.toggle('hidden', currentMain!=='bulk');
      // reset active button
      (currentMain==='single'?document.getElementById('subFiltersSingle'):document.getElementById('subFiltersBulk')).querySelectorAll('.filter-btn').forEach((b,i)=>{b.classList.toggle('active', i===0);});
      renderProducts();
    });
  });
}

// Search
const searchInput = document.getElementById('productSearch');
searchInput?.addEventListener('input', () => {
  document.body.classList.toggle('searching', !!searchInput.value.trim());
  renderProducts();
});

// (Legacy filtering removed - now handled by subcategory buttons)

// Form validation (client-side only demo)
const form = document.getElementById('contactForm');
form?.addEventListener('submit', e => {
  e.preventDefault();
  const status = document.getElementById('formStatus');
  let valid = true;
  ['name','email','message'].forEach(field => {
    const input = form.querySelector(`[name="${field}"]`);
    const errorEl = form.querySelector(`[data-error-for="${field}"]`);
    if (!input.value.trim()) {
      valid = false;
      errorEl.textContent = 'Required';
    } else if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      valid = false;
      errorEl.textContent = 'Invalid email';
    } else {
      errorEl.textContent = '';
    }
  });
  if (valid) {
    status.textContent = 'Message sent (demo). We will reply soon!';
    form.reset();
    setTimeout(() => (status.textContent = ''), 4000);
  } else {
    status.textContent = 'Please correct errors above.';
  }
});

// Intersection Observer for fade-ins
let observer;
function observeFadeIns() {
  const els = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(el => observer.observe(el));
  } else {
    els.forEach(el => el.classList.add('visible'));
  }
}

// Year auto update
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Language toggle (rudimentary, two-language support placeholder)
const translations = {
  ar: {
    'nav.home':'الرئيسية','nav.about':'من نحن','nav.products':'المنتجات','nav.events':'الفعاليات','nav.services':'الخدمات','nav.faq':'الأسئلة','nav.contact':'اتصل بنا',
    'products.title':'منتجاتنا','products.intro':'تصفح فئات منتجاتنا اللبنانية. كل صنف يتضمن وصفاً ومكونات.',
    'products.singleServe':'منتجات فردية','products.bulk':'منتجات بالجملة'
  }
};
let currentLang = 'en';
const langBtn = document.getElementById('langToggle');
langBtn?.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  langBtn.textContent = currentLang === 'en' ? 'AR' : 'EN';
  applyTranslations();
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('rtl', currentLang==='ar');
});

function applyTranslations() {
  if (currentLang === 'en') return; // only override for Arabic for now
  const map = translations[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (map[key]) el.textContent = map[key];
  });
}

// Highlight helper
function highlight(text, term) {
  if (!term) return text;
  try {
    const re = new RegExp(`(${term.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')})`,'ig');
    return text.replace(re,'<mark style="background:rgba(200,16,46,0.25);padding:0 .15em;border-radius:3px;">$1</mark>');
  } catch { return text; }
}

// Scroll header transparency handling
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) document.body.classList.add('scrolled'); else document.body.classList.remove('scrolled');
});

// Initial renders & setup with optional Supabase fetch
async function initializeSite(){
  loadOverrides();
  await tryRemoteLoad();
  buildSubFilters();
  initMainTabs();
  renderFeatured();
  renderBestsellers();
  renderNewArrivals();
  renderSeasonal();
  renderCustomSections();
  renderProducts();
  observeFadeIns();
  applyTranslations();
  applyContentOverrides();
}

async function tryRemoteLoad(){
  const anonKey = window.SUPABASE_ANON_KEY; // expect injection
  if(!anonKey || !window.createSupabaseClient) return; // no remote
  try {
    const client = window.createSupabaseClient('https://xbznaxiummganlidnmdd.supabase.co', anonKey);
    // Load subcategories
    const { data: subs, error: subsErr } = await client.from('subcategories').select('*').eq('active', true).order('sort_order');
    if (subsErr && /not found/i.test(subsErr.message)) {
      console.warn('Supabase table subcategories not found. Did you run the migration? Skipping remote load.');
      return; // abort further remote attempts
    }
    if (subs?.length){
      SUBCATS.single = subs.filter(s=>s.category_type==='single').map(s=>s.slug.replace(/-/g,' '));
      SUBCATS.bulk = subs.filter(s=>s.category_type==='bulk').map(s=>s.slug.replace(/-/g,' '));
      // banners mapping
      subs.forEach(s=>{ if (s.banner_image_url) BANNERS[s.slug.replace(/-/g,' ')] = s.banner_image_url; });
    }
    // Load products with their section assignments
    const { data: prods, error: prodsErr } = await client.from('products').select(`
      *,
      product_sections(section_key)
    `).eq('active', true).limit(500);
    if (prodsErr && /not found/i.test(prodsErr.message)) {
      console.warn('Supabase table products not found. Skipping remote products load.');
    }
    if (prods?.length){
      productsData.length = 0;
      prods.forEach(p=> {
        // Extract section keys
        const sections = p.product_sections?.map(ps => ps.section_key) || [];
        
        productsData.push({
          id: p.id,
          name: p.name_en || 'Unnamed',
          category: p.sub_slug || 'general',
          mainType: p.main_type,
          sub: (p.sub_slug || '').replace(/-/g,' '),
          featured: !!p.featured, // Use database featured field
          sections: sections, // Add sections array for filtering
          image: p.image_url || FALLBACK_IMAGE,
          description: p.description_en || '',
          ingredients: Array.isArray(p.ingredients)? p.ingredients : []
        });
      });
    }
    // Sections (hero/about/contact/etc) override - handle all sections with proper ordering
    const { data: sections, error: sectionsErr } = await client.from('sections').select('*');
    if (sectionsErr && /not found/i.test(sectionsErr.message)) {
      console.warn('Supabase table sections not found.');
    }
    if (sections?.length){
      // Store sections data globally for renderCustomSections to use
      window.sectionsData = sections;
      
      SITE_OVERRIDES = SITE_OVERRIDES || {};
      
      // Define section order: hero, about, products, custom sections, then contact at end
      const fixedSections = ['hero', 'about'];
      const contactSection = sections.find(s => s.key === 'contact');
      
      // Process fixed sections first (hero, about)
      fixedSections.forEach(key => {
        const section = sections.find(s => s.key === key);
        if (section) {
          if (section.key === 'hero') {
            SITE_OVERRIDES.hero = { title: section.title_en, lead: section.body_en, image: section.image_url };
          }
          if (section.key === 'about') {
            SITE_OVERRIDES.about = { heading: section.title_en, text: section.body_en? [section.body_en]:[], image: section.image_url };
          }
          updateSectionContent(section.key, section);
        }
      });
      
      // Skip custom sections here - they'll be handled by renderCustomSections with products
      
      // Process contact section last (always at bottom)
      if (contactSection) {
        updateSectionContent('contact', contactSection);
      }
    }
  } catch(err){ console.warn('Remote load failed', err); }
}

// Update section content dynamically based on section data from database
function updateSectionContent(sectionKey, sectionData) {
  // Handle hero/home ID mismatch - hero section in HTML has id="home"
  const actualSectionId = sectionKey === 'hero' ? 'home' : sectionKey;
  let section = document.getElementById(actualSectionId);
  
  // If section doesn't exist, create it dynamically (but not for hero - it already exists as "home")
  if (!section && sectionKey !== 'hero') {
    section = createNewSection(sectionKey, sectionData);
    if (!section) return;
  }
  
  // Skip if hero section not found (shouldn't happen)
  if (!section && sectionKey === 'hero') {
    console.warn('Hero section with id="home" not found');
    return;
  }
  
  // Update section title if exists
  const titleElement = section.querySelector('.section-title, h2, h3, h1');
  if (titleElement && sectionData.title_en) {
    titleElement.textContent = sectionData.title_en;
  }
  
  // Handle different section types
  if (sectionKey === 'hero') {
    // For hero section, update the lead paragraph
    const leadElement = section.querySelector('.lead, .hero-content p');
    if (leadElement && sectionData.body_en) {
      leadElement.innerHTML = sectionData.body_en;
    }
  } else if (sectionKey === 'contact') {
    // For contact section, update the contact-info content
    const contactInfo = section.querySelector('.contact-info');
    if (contactInfo && sectionData.body_en) {
      // Keep the h3 title, replace the content after it
      const h3 = contactInfo.querySelector('h3');
      contactInfo.innerHTML = (h3 ? h3.outerHTML : '<h3>Company Info</h3>') + sectionData.body_en;
    }
  } else {
    // For other sections, update general content areas
    const bodyElement = section.querySelector('.section-content, .section-text, p:not(.form-status)');
    if (bodyElement && sectionData.body_en) {
      bodyElement.innerHTML = sectionData.body_en;
    }
  }
  
  // Update section image if exists
  const imageElement = section.querySelector('img:not([src*="maps"])'); // Exclude maps iframe
  if (imageElement && sectionData.image_url) {
    imageElement.src = sectionData.image_url;
    imageElement.alt = sectionData.title_en || 'Section image';
  }
  
  console.log(`Updated section: ${sectionKey} (HTML id: ${actualSectionId})`, sectionData);
}

// Create new section if it doesn't exist in HTML  
function createNewSection(sectionKey, sectionData) {
  const main = document.querySelector('main') || document.body;
  const contactSection = document.getElementById('contact');
  
  const newSection = document.createElement('section');
  newSection.id = sectionKey;
  newSection.className = 'section-padding section-alt';
  
  newSection.innerHTML = `
    <div class="container">
      <h2 class="section-title">${sectionData.title_en || sectionKey}</h2>
      <div class="section-content">
        ${sectionData.body_en || ''}
      </div>
      ${sectionData.image_url ? `<img src="${sectionData.image_url}" alt="${sectionData.title_en || sectionKey}" loading="lazy" />` : ''}
    </div>
  `;
  
  // Insert new sections after products section, before contact (contact always stays at bottom)
  const productsSection = document.getElementById('products');
  const contactSection = document.getElementById('contact');
  
  if (productsSection) {
    // Insert after products section
    productsSection.insertAdjacentElement('afterend', newSection);
  } else if (contactSection) {
    // Fallback: insert before contact if products section not found
    main.insertBefore(newSection, contactSection);
  } else {
    // Final fallback: insert before footer or at end
    const footer = document.querySelector('footer');
    if (footer) {
      main.insertBefore(newSection, footer);
    } else {
      main.appendChild(newSection);
    }
  }
  
  console.log(`Created new section: ${sectionKey} (positioned after products, before contact)`);
  return newSection;
}

initializeSite();

// Attach fallback handlers to images (run after each render)
function attachImageFallbacks() {
  document.querySelectorAll('#featuredProducts img, #productGrid img, .about-image-wrapper img').forEach(img => {
    if (!img.dataset.fallbackBound) {
      img.dataset.fallbackBound = 'true';
      img.addEventListener('error', () => {
        if (img.src !== FALLBACK_IMAGE) {
          img.src = FALLBACK_IMAGE;
        }
      });
    }
  });
}

// Accessibility: trap focus when menu open (simplified)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navList.classList.contains('open')) {
    navList.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.focus();
  }
});
