/* =============================
   Karam Libnan - Main JS
   Handles: navigation toggle, smooth active link highlighting, product rendering & filtering, simple form validation, intersection animations.
   ============================= */

// Fallback image (shown if external image fails to load)
const FALLBACK_IMAGE = 'https://placehold.co/400x300?text=Image+Unavailable';

// Extended product dataset with mainType (single/bulk) and subcategory mapping
const productsData = [
  {
    id: 1,
    name: 'Homemade Fig Jam',
    category: 'homemade',
    mainType: 'single',
  sub: 'pastes',
    featured: true,
  image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&q=80',
    description: 'Rich, slow-cooked fig jam with subtle sweetness.',
    ingredients: ['Figs', 'Organic Cane Sugar', 'Lemon Juice']
  },
  {
    id: 2,
    name: 'Pickled Cucumbers',
    category: 'canned',
    mainType: 'single',
  sub: 'ordinary pickles',
    featured: true,
  image: 'https://images.unsplash.com/photo-1621378580334-79a6845bb3e7?auto=format&fit=crop&w=800&q=80',
    description: 'Crisp and tangy traditional Lebanese pickles.',
    ingredients: ['Cucumbers', 'Vinegar', 'Sea Salt', 'Garlic', 'Dill']
  },
  {
    id: 3,
    name: 'Herbal Thyme Blend (Za\'atar)',
    category: 'herbal',
    mainType: 'single',
  sub: 'herbal',
    featured: true,
  image: 'https://silkroadrecipes.com/wp-content/uploads/2020/07/Zaatar-Spice-Blend-square.jpg',
    description: 'Fragrant mountain thyme mix, perfect with olive oil & bread.',
    ingredients: ['Thyme', 'Sesame Seeds', 'Sumac', 'Salt']
  },
  // Additional Single Serve products to cover all subcategories
  {
    id: 10,
    name: 'Fresh Mountain Cucumbers',
    category: 'fresh',
    mainType: 'single',
    sub: 'fresh veges',
    featured: false,
    image: 'https://placehold.co/400x300?text=Fresh+Cucumbers',
    description: 'Crisp organically-grown mountain cucumbers.',
    ingredients: ['Cucumber']
  },
  {
    id: 11,
    name: 'Fresh Pickled Turnips',
    category: 'canned',
    mainType: 'single',
    sub: 'fresh pickles',
    featured: false,
    image: 'https://placehold.co/400x300?text=Fresh+Pickles',
    description: 'Bright pink turnips pickled same-day for crunch.',
    ingredients: ['Turnip','Beet','Salt','Vinegar']
  },
  {
    id: 12,
    name: 'Extra Virgin Olive Oil 250ml',
    category: 'olive',
    mainType: 'single',
    sub: 'olive oil',
    featured: false,
    image: 'https://placehold.co/400x300?text=Olive+Oil',
    description: 'Cold-pressed early harvest extra virgin olive oil.',
    ingredients: ['Olives']
  },
  {
    id: 13,
    name: 'Labne & Sun-Dried Kishik Duo',
    category: 'dairy',
    mainType: 'single',
    sub: 'labne & kishik',
    featured: false,
    image: 'https://placehold.co/400x300?text=Labne+&+Kishik',
    description: 'Creamy labne with a side of powdered kishik.',
    ingredients: ['Labne','Fermented Yogurt Grain (Kishik)','Salt']
  },
  {
    id: 14,
    name: 'Wild Rose Hydrosol',
    category: 'herbal',
    mainType: 'single',
    sub: 'hydrosols',
    featured: false,
    image: 'https://placehold.co/400x300?text=Hydrosol',
    description: 'Steam-distilled wild rose floral water.',
    ingredients: ['Rose Petals','Spring Water']
  },
  {
    id: 15,
    name: 'Natural Carob Syrup',
    category: 'sweets',
    mainType: 'single',
    sub: 'natural syrubs',
    featured: false,
    image: 'https://placehold.co/400x300?text=Carob+Syrup',
    description: 'Thick natural syrup extracted from carob pods.',
    ingredients: ['Carob Pods','Water']
  },
  {
    id: 16,
    name: 'Stone-Ground Tahhene Jar',
    category: 'pastes',
    mainType: 'single',
    sub: 'tahhene',
    featured: false,
    image: 'https://placehold.co/400x300?text=Tahini',
    description: 'Sesame tahini ground on traditional stones.',
    ingredients: ['Sesame Seeds']
  },
  {
    id: 17,
    name: 'Aged Apple Vinegar',
    category: 'herbal',
    mainType: 'single',
    sub: 'vinegar',
    featured: false,
    image: 'https://placehold.co/400x300?text=Vinegar',
    description: 'Naturally fermented apple vinegar aged in barrels.',
    ingredients: ['Apples','Mother Culture']
  },
  {
    id: 18,
    name: 'Apricot Leather (Kamar El Din)',
    category: 'sweets',
    mainType: 'single',
    sub: 'kamar el din',
    featured: false,
    image: 'https://placehold.co/400x300?text=Kamar+El+Din',
    description: 'Traditional sun-dried apricot fruit leather.',
    ingredients: ['Apricots']
  },
  // Bulk products to cover all bulk subcategories
  {
    id: 19,
    name: 'Bulk Fresh Cucumbers 5kg',
    category: 'fresh',
    mainType: 'bulk',
    sub: 'fresh veges',
    featured: false,
    image: 'https://placehold.co/400x300?text=Bulk+Cucumbers',
    description: 'Harvested same-day cucumbers packed for food service.',
    ingredients: ['Cucumber']
  },
  {
    id: 20,
    name: 'Bulk Fresh Pickled Turnips 3kg',
    category: 'canned',
    mainType: 'bulk',
    sub: 'fresh pickles',
    featured: false,
    image: 'https://placehold.co/400x300?text=Bulk+Pickles',
    description: 'Crisp pink turnips pickled in large format tubs.',
    ingredients: ['Turnip','Beet','Salt','Vinegar']
  },
  {
    id: 21,
    name: 'Bulk Ordinary Pickles 10kg',
    category: 'canned',
    mainType: 'bulk',
    sub: 'ordinary pickles',
    featured: false,
    image: 'https://placehold.co/400x300?text=Bulk+Ordinary+Pickles',
    description: 'Traditional brined cucumbers for wholesale.',
    ingredients: ['Cucumber','Salt','Water','Garlic']
  },
  {
    id: 22,
    name: 'Bulk Mixed Olives 8kg',
    category: 'canned',
    mainType: 'bulk',
    sub: 'olives',
    featured: false,
    image: 'https://placehold.co/400x300?text=Bulk+Olives',
    description: 'Assorted cured olives in brine and herbs.',
    ingredients: ['Olives','Brine','Herbs']
  },
  {
    id: 23,
    name: 'Bulk Extra Virgin Olive Oil 16L',
    category: 'olive',
    mainType: 'bulk',
    sub: 'olive oil',
    featured: false,
    image: 'https://placehold.co/400x300?text=Bulk+Olive+Oil',
    description: 'Tin container of cold-pressed EVOO for restaurants.',
    ingredients: ['Olives']
  },
  {
    id: 24,
    name: 'Bulk Sunflower Oil 20L',
    category: 'oil',
    mainType: 'bulk',
    sub: 'sunflower oil',
    featured: false,
    image: 'https://placehold.co/400x300?text=Sunflower+Oil',
    description: 'High-quality refined sunflower oil for frying & cooking.',
    ingredients: ['Sunflower Seeds']
  },
  {
    id: 25,
    name: 'Bulk Kishik Powder 5kg',
    category: 'dairy',
    mainType: 'bulk',
    sub: 'kishik',
    featured: false,
    image: 'https://placehold.co/400x300?text=Kishik',
    description: 'Fermented yogurt & cracked wheat powder large pack.',
    ingredients: ['Fermented Yogurt','Cracked Wheat','Salt']
  },
  {
    id: 26,
    name: 'Bulk Cooking Paste Assortment',
    category: 'pastes',
    mainType: 'bulk',
    sub: 'pastes',
    featured: false,
    image: 'https://placehold.co/400x300?text=Pastes',
    description: 'Selection of tomato, pepper, and garlic pastes.',
    ingredients: ['Tomato','Pepper','Garlic','Salt']
  },
  {
    id: 27,
    name: 'Bulk Pomegranate Molasses 5L',
    category: 'sweets',
    mainType: 'bulk',
    sub: 'molases',
    featured: false,
    image: 'https://placehold.co/400x300?text=Pomegranate+Molasses',
    description: 'Economy container for sauce production and marinades.',
    ingredients: ['Pomegranate Juice']
  },
  {
    id: 28,
    name: 'Bulk Herbal Hydrosols Pack',
    category: 'herbal',
    mainType: 'bulk',
    sub: 'hydrosols',
    featured: false,
    image: 'https://placehold.co/400x300?text=Hydrosols',
    description: 'Mixed floral & herbal distillates for cosmetic use.',
    ingredients: ['Herbs','Water']
  },
  {
    id: 29,
    name: 'Bulk Natural Syrups Assortment',
    category: 'sweets',
    mainType: 'bulk',
    sub: 'natural syrubs',
    featured: false,
    image: 'https://placehold.co/400x300?text=Syrups',
    description: 'Carob, grape and date syrups in catering jugs.',
    ingredients: ['Carob','Grapes','Dates']
  },
  {
    id: 30,
    name: 'Bulk Tahhene 10kg Pail',
    category: 'pastes',
    mainType: 'bulk',
    sub: 'tahhene',
    featured: false,
    image: 'https://placehold.co/400x300?text=Tahini+Bulk',
    description: 'Large pail of stone-ground tahini.',
    ingredients: ['Sesame Seeds']
  },
  {
    id: 31,
    name: 'Bulk Natural Vinegar Assortment',
    category: 'herbal',
    mainType: 'bulk',
    sub: 'vinegar',
    featured: false,
    image: 'https://placehold.co/400x300?text=Vinegar+Bulk',
    description: 'Apple and grape vinegar varieties for culinary uses.',
    ingredients: ['Apple','Grape','Mother Culture']
  },
  {
    id: 32,
    name: 'Bulk Dried Herbal Mix',
    category: 'herbal',
    mainType: 'bulk',
    sub: 'herbal',
    featured: false,
    image: 'https://placehold.co/400x300?text=Herbal+Mix',
    description: 'Large sack of mixed Lebanese dried herbs.',
    ingredients: ['Oregano','Thyme','Sumac','Sesame']
  },
  {
    id: 33,
    name: 'Bulk Apricot Leather Sheets',
    category: 'sweets',
    mainType: 'bulk',
    sub: 'kamar el din',
    featured: false,
    image: 'https://placehold.co/400x300?text=Apricot+Leather',
    description: 'Stacked fruit leather sheets vacuum packed.',
    ingredients: ['Apricots']
  }
  ,{
    id: 4,
    name: 'Orange Blossom Honey',
    category: 'homemade',
  mainType: 'single',
  sub: 'natural syrubs',
    featured: false,
  image: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=80',
    description: 'Raw honey infused with orange blossom aromas.',
    ingredients: ['Pure Honey', 'Orange Blossom Essence']
  },
  {
    id: 5,
    name: 'Stuffed Vine Leaves',
    category: 'canned',
  mainType: 'single',
  sub: 'ready to serve',
    featured: false,
  // Provided by user (Unsplash+ premium image - ensure license permits intended usage before production)
  image: 'https://plus.unsplash.com/premium_photo-1676964403940-a301447aeb3f?auto=format&fit=crop&w=800&q=80',
    description: 'Hand-rolled vine leaves with aromatic rice filling.',
    ingredients: ['Vine Leaves', 'Rice', 'Onion', 'Olive Oil', 'Herbs']
  },
  {
    id: 6,
    name: 'Rose Petal Jam',
    category: 'sweets',
  mainType: 'single',
  sub: 'pastes',
    featured: false,
  image: 'https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=800&q=80',
    description: 'Delicate jam capturing the essence of rose petals.',
    ingredients: ['Rose Petals', 'Sugar', 'Lemon Juice']
  },
  {
    id: 7,
    name: 'Pomegranate Molasses',
    category: 'homemade',
  mainType: 'single',
  sub: 'molases',
    featured: false,
  image: 'https://www.marthastewart.com/thmb/hqfqo5wjANUxa7VbsaOxqS7xIjk=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/ms-pomegranate-molasses-getty-0b12cb3cd1294ecbb86468a517437d5c.jpg',
    description: 'Thick, tangy reduction ideal for dressings & marinades.',
    ingredients: ['Pomegranate Juice', 'Natural Sugar', 'Lemon']
  },
  {
    id: 8,
    name: 'Spiced Olive Mix',
    category: 'canned',
  mainType: 'single',
  sub: 'olives',
    featured: false,
  image: 'https://www.olivemypickle.com/cdn/shop/files/PDP-olives_22.png?v=1725545524',
    description: 'Marinated olives with herbs and mild spice.',
    ingredients: ['Olives', 'Olive Oil', 'Herbs', 'Spices']
  },
  {
    id: 9,
    name: 'Carob Molasses',
    mainType: 'single',
    sub: 'molases',
    category: 'sweets',
    featured: false,
  image: 'https://static.ticimax.cloud/cdn-cgi/image/width=370,quality=85/13473/uploads/urunresimleri/buyuk/bal-pekmezdupnisa-ciftligiharnup-pekme-9-3fb3.png',
    description: 'Natural sweetener with deep caramel-like flavor.',
    ingredients: ['Carob Pods', 'Water']
  }
];

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
  const featured = productsData.filter(p => p.featured).slice(0, 3);
  container.innerHTML = featured.map(p => cardTemplate(p, true)).join('');
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
    'products.singleServe':'منتجات فردية','products.bulk':'منتجات بالجملة',
    'pending.title':'قريباً','pending.intro':'يتم إعداد أصناف جديدة أصيلة. ترقبونا!','pending.placeholder':'منتج قادم','pending.desc':'بانتظار التوفر...'
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
    // Load products
    const { data: prods, error: prodsErr } = await client.from('products').select('*').eq('active', true).limit(500);
    if (prodsErr && /not found/i.test(prodsErr.message)) {
      console.warn('Supabase table products not found. Skipping remote products load.');
    }
    if (prods?.length){
      productsData.length = 0;
      prods.forEach(p=> productsData.push({
        id: p.id,
        name: p.name_en || 'Unnamed',
        category: p.sub_slug || 'general',
        mainType: p.main_type,
        sub: (p.sub_slug || '').replace(/-/g,' '),
        featured: !!p.featured,
        image: p.image_url || FALLBACK_IMAGE,
        description: p.description_en || '',
        ingredients: Array.isArray(p.ingredients)? p.ingredients : []
      }));
    }
    // Sections (hero/about) override
    const { data: sections, error: sectionsErr } = await client.from('sections').select('*');
    if (sectionsErr && /not found/i.test(sectionsErr.message)) {
      console.warn('Supabase table sections not found.');
    }
    if (sections?.length){
      SITE_OVERRIDES = SITE_OVERRIDES || {};
      sections.forEach(sec=>{
        if (sec.key==='hero') {
          SITE_OVERRIDES.hero = { title: sec.title_en, lead: sec.body_en, image: sec.image_url };
        }
        if (sec.key==='about') {
          SITE_OVERRIDES.about = { heading: sec.title_en, text: sec.body_en? [sec.body_en]:[], image: sec.image_url };
        }
      });
    }
  } catch(err){ console.warn('Remote load failed', err); }
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
