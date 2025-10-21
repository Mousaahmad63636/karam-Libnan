/* =============================
   Karam Libnan - Main JS
   Handles: navigation toggle, smooth active link highlighting, product rendering & filtering, simple form validation, intersection animations.
   ============================= */

// Fallback image (shown if external image fails to load)
const FALLBACK_IMAGE = 'https://placehold.co/400x300?text=Image+Unavailable';

// Extended product dataset with mainType (single/bulk) and subcategory mapping
const productsData = [];

// Global main categories storage
let mainCategories = [
  { slug: 'single', title_en: 'Lebanese Mouneh', title_ar: 'منتجات لبنانية', description_en: 'Authentic Lebanese homemade products crafted with traditional recipes and the finest natural ingredients.', description_ar: 'منتجات لبنانية أصيلة مصنوعة يدوياً بوصفات تقليدية وأجود المكونات الطبيعية.', sort_order: 1 },
  { slug: 'bulk', title_en: 'Bulk Products', title_ar: 'منتجات بالجملة', description_en: 'Large quantity products perfect for restaurants, hotels, and wholesale distribution.', description_ar: 'منتجات بكميات كبيرة مثالية للمطاعم والفنادق والتوزيع بالجملة.', sort_order: 2 }
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
    
    // If we have full content, use it; otherwise fall back to text array
    if (SITE_OVERRIDES.about.fullContent) {
      const aboutSection = document.querySelector('#about .container .grid > div:first-child');
      if (aboutSection) {
        const title = aboutSection.querySelector('h2');
        const titleHTML = title ? title.outerHTML : `<h2 id="aboutHeading" class="section-title">${SITE_OVERRIDES.about.heading}</h2>`;
        aboutSection.innerHTML = titleHTML + SITE_OVERRIDES.about.fullContent;
      }
    } else if (SITE_OVERRIDES.about.text && Array.isArray(SITE_OVERRIDES.about.text)) {
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
  // Products
  if (SITE_OVERRIDES.products) {
    if (SITE_OVERRIDES.products.title) {
      const productsHeading = document.querySelector('#productsHeading');
      if (productsHeading) productsHeading.textContent = SITE_OVERRIDES.products.title;
    }
    if (SITE_OVERRIDES.products.intro) {
      const productsIntro = document.querySelector('#products .section-intro');
      if (productsIntro) productsIntro.textContent = SITE_OVERRIDES.products.intro;
    }
  }
}

// Navigation initialization function
function initializeNavigation() {
  // Navigation toggle with sidebar and overlay
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  const navOverlay = document.getElementById('navOverlay');

  function toggleNavigation() {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    const isOpen = !expanded;
    
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navList.classList.toggle('open', isOpen);
    navOverlay.classList.toggle('show', isOpen);
    
    // Add/remove nav-open class to body for blur effect
    document.body.classList.toggle('nav-open', isOpen);
    
    // Prevent body scroll when sidebar is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeNavigation() {
    navToggle.setAttribute('aria-expanded', 'false');
    navList.classList.remove('open');
    navOverlay.classList.remove('show');
    document.body.classList.remove('nav-open');
    document.body.style.overflow = '';
  }

  navToggle?.addEventListener('click', toggleNavigation);

  // Close nav on overlay click
  navOverlay?.addEventListener('click', closeNavigation);

  // Close button in sidebar
  const navClose = document.querySelector('.nav-close');
  navClose?.addEventListener('click', closeNavigation);

  // Close nav on link click (mobile) + handle active states
  navList?.addEventListener('click', e => {
    if (e.target.matches('a')) {
      // Remove active class from all nav links
      document.querySelectorAll('.nav-list a').forEach(link => {
        link.classList.remove('active');
      });
      
      // Add active class to clicked link
      e.target.classList.add('active');
      
      closeNavigation();
    }
  });

  // Close nav on escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navList.classList.contains('open')) {
      closeNavigation();
    }
  });

  // Active link highlighting for navigation
  function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const allNavLinks = document.querySelectorAll('.nav-list a');
    
    function onScroll() {
      const scrollPos = window.scrollY + 120; // offset for header
      sections.forEach(sec => {
        if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
          allNavLinks.forEach(l => l.classList.remove('active'));
          const activeLink = document.querySelector(`.nav-list a[href="#${sec.id}"]`);
          activeLink?.classList.add('active');
        }
      });
    }
    
    window.addEventListener('scroll', onScroll);
    onScroll(); // Call once on load
  }

  // Initialize active navigation
  updateActiveNavigation();

  // Search functionality (after navigation is loaded)
  initializeSearch();
}

// Search initialization
function initializeSearch() {
  const searchInput = document.getElementById('productSearch');
  const searchInputDesktop = document.getElementById('productSearchDesktop');

  // Handle mobile search
  searchInput?.addEventListener('input', () => {
    document.body.classList.toggle('searching', !!searchInput.value.trim());
    renderProducts();
  });

  // Handle desktop search
  searchInputDesktop?.addEventListener('input', () => {
    document.body.classList.toggle('searching', !!searchInputDesktop.value.trim());
    renderProducts();
  });

  // Search toggle functionality for mobile
  const searchToggle = document.getElementById('searchToggle');
  searchToggle?.addEventListener('click', () => {
    const isExpanded = searchInput.classList.contains('expanded');
    if (isExpanded) {
      searchInput.classList.remove('expanded');
      searchInput.value = '';
      document.body.classList.remove('searching');
      renderProducts();
    } else {
      searchInput.classList.add('expanded');
      setTimeout(() => searchInput.focus(), 350); // Wait for animation
    }
  });

  // Search toggle functionality for desktop
  const searchToggleDesktop = document.getElementById('searchToggleDesktop');
  searchToggleDesktop?.addEventListener('click', () => {
    const isExpanded = searchInputDesktop.classList.contains('expanded');
    if (isExpanded) {
      searchInputDesktop.classList.remove('expanded');
      searchInputDesktop.value = '';
      document.body.classList.remove('searching');
      renderProducts();
    } else {
      searchInputDesktop.classList.add('expanded');
      setTimeout(() => searchInputDesktop.focus(), 350); // Wait for animation
    }
  });
}

// Inject featured products
function renderFeatured() {
  const container = document.getElementById('featuredProducts');
  if (!container) return;
  const featured = productsData.filter(p => p.featured).sort((a, b) => {
    const orderA = a.sort_order ?? 999;
    const orderB = b.sort_order ?? 999;
    return orderA - orderB;
  });
  container.innerHTML = featured.map(p => cardTemplate(p, true)).join('');
}

// Inject bestsellers products
function renderBestsellers() {
  const container = document.getElementById('bestsellersProducts');
  if (!container) return;
  const bestsellers = productsData.filter(p => p.sections?.includes('bestsellers')).sort((a, b) => {
    const orderA = a.sort_order ?? 999;
    const orderB = b.sort_order ?? 999;
    return orderA - orderB;
  });
  if (bestsellers.length > 0) {
    container.innerHTML = bestsellers.map(p => cardTemplate(p)).join('');
    document.querySelector('.bestsellers').style.display = 'block';
  }
}

// Inject new arrivals products
function renderNewArrivals() {
  const container = document.getElementById('newArrivalsProducts');
  if (!container) return;
  const newArrivals = productsData.filter(p => p.sections?.includes('new-arrivals')).sort((a, b) => {
    const orderA = a.sort_order ?? 999;
    const orderB = b.sort_order ?? 999;
    return orderA - orderB;
  });
  if (newArrivals.length > 0) {
    container.innerHTML = newArrivals.map(p => cardTemplate(p)).join('');
    document.querySelector('.new-arrivals').style.display = 'block';
  }
}

// Inject seasonal products
function renderSeasonal() {
  const container = document.getElementById('seasonalProducts');
  if (!container) return;
  const seasonal = productsData.filter(p => p.sections?.includes('seasonal')).sort((a, b) => {
    const orderA = a.sort_order ?? 999;
    const orderB = b.sort_order ?? 999;
    return orderA - orderB;
  });
  if (seasonal.length > 0) {
    container.innerHTML = seasonal.map(p => cardTemplate(p)).join('');
    document.querySelector('.seasonal').style.display = 'block';
  }
}

// Render custom sections dynamically
function renderCustomSections() {
  // Get all unique section keys from products (excluding core sections)
  const coreSection = ['featured', 'bestsellers', 'new-arrivals', 'seasonal', 'hero', 'about', 'products', 'contact'];
  
  const customSections = [...new Set(
    productsData.flatMap(p => p.sections || [])
      .filter(section => !coreSection.includes(section))
  )];

  customSections.forEach(sectionKey => {
    const products = productsData.filter(p => p.sections?.includes(sectionKey)).sort((a, b) => {
      const orderA = a.sort_order ?? 999;
      const orderB = b.sort_order ?? 999;
      return orderA - orderB;
    });
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
  const searchTerm = (document.getElementById('productSearch')?.value || document.getElementById('productSearchDesktop')?.value || '').trim();
  const name = highlight(getLocalizedText(item, 'name'), searchTerm);
  const desc = highlight(getLocalizedText(item, 'description'), searchTerm);
  
  // Get localized arrays
  const ingredients = getLocalizedArray(item, 'ingredients');
  const variants = getLocalizedArray(item, 'variants');
  const tags = getLocalizedArray(item, 'tags');
  
  // Get translations
  const map = translations[currentLang];
  const ingredientsLabel = map && map['products.ingredients'] ? map['products.ingredients'] : 'Ingredients:';
  const variantsLabel = map && map['products.variants'] ? map['products.variants'] : 'Variants:';
  const featuredLabel = map && map['featured.badge'] ? map['featured.badge'] : 'Featured';
  
  // Generate variants HTML if variants exist
  const variantsHTML = variants.length > 0 
    ? `<div class="product-variants"><strong>${variantsLabel}</strong> ${variants.join(', ')}</div>`
    : '';
  
  // Generate tags HTML if tags exist
  const tagsHTML = tags.length > 0 
    ? `<div class="product-tags">${tags.map(tag => `<span class="product-tag">${tag}</span>`).join('')}</div>`
    : '';
  
  return `<article class="card fade-in" data-category="${item.category}" data-sub="${item.sub}" data-main="${item.mainType}" data-product-id="${item.id}" style="cursor: pointer;">
    ${isFeatured ? `<span class="badge">${featuredLabel}</span>` : ''}
    <img src="${item.image}" alt="${getLocalizedText(item, 'name')} image" loading="lazy" data-original="${item.image}" />
    <div class="card-body">
      <h3 class="card-title">${name}</h3>
      <p class="desc">${desc}</p>
      <div class="ingredients"><strong>${ingredientsLabel}</strong> ${ingredients.join(', ')}</div>
      ${variantsHTML}
      ${tagsHTML}
    </div>
  </article>`;
}

// Render all products
let currentMain = '';  // Will be set dynamically to first available main category
let currentSub = 'all';
function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const searchTerm = (document.getElementById('productSearch')?.value || document.getElementById('productSearchDesktop')?.value || '').trim().toLowerCase();
  const items = productsData.filter(p => {
    // Check main type and sub category
    const mainMatch = p.mainType === currentMain;
    const subMatch = currentSub === 'all' || p.sub === currentSub;
    
    // Check search term in localized content
    if (!searchTerm) return mainMatch && subMatch;
    
    const name = getLocalizedText(p, 'name').toLowerCase();
    const description = getLocalizedText(p, 'description').toLowerCase();
    const searchMatch = name.includes(searchTerm) || description.includes(searchTerm);
    
    return mainMatch && subMatch && searchMatch;
  }).sort((a, b) => {
    // Sort by sort_order ascending (lower numbers first)
    const orderA = a.sort_order ?? 999;
    const orderB = b.sort_order ?? 999;
    return orderA - orderB;
  });
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
  
  // Get current main category data
  const currentMainCategory = mainCategories.find(c => c.slug === currentMain);
  
  // Use translated subcategory name for banner text
  const bannerText = currentSub === 'all' 
    ? (currentLang === 'ar' 
        ? (currentMainCategory?.title_ar || currentMainCategory?.title_en || currentMain) + ' منتجات'
        : (currentMainCategory?.title_en || currentMain) + ' products')
    : translateSubcategory(currentSub);
  
  // Get description for main category (only show when viewing 'all' subcategory)
  const description = currentSub === 'all' && currentMainCategory 
    ? (currentLang === 'ar' && currentMainCategory.description_ar 
        ? currentMainCategory.description_ar 
        : currentMainCategory.description_en || '')
    : '';
  
  banner.innerHTML = `
    <div class="banner-content">
      <span class="banner-title">${bannerText}</span>
      ${description ? `<p class="banner-description">${description}</p>` : ''}
    </div>
  `;
  banner.setAttribute('aria-hidden','false');
}

function capitalizeWords(str) { return str.replace(/\b\w/g, c => c.toUpperCase()); }

function buildMainTabs() {
  const mainTabsContainer = document.querySelector('.main-cat-tabs');
  if (!mainTabsContainer) return;
  
  // Set currentMain to first category if not set
  if (!currentMain && mainCategories.length > 0) {
    currentMain = mainCategories[0].slug;
  }
  
  // Generate main category tabs dynamically with localized titles and descriptions
  const tabsHTML = mainCategories.map((cat, index) => {
    const isActive = cat.slug === currentMain;
    const title = currentLang === 'ar' && cat.title_ar ? cat.title_ar : cat.title_en;
    const description = currentLang === 'ar' && cat.description_ar ? cat.description_ar : cat.description_en || '';
    
    return `
      <div class="tab-container">
        <button role="tab" aria-selected="${isActive}" class="main-cat-tab${isActive ? ' active' : ''}" data-main="${cat.slug}">${title}</button>
        ${description ? `<div class="tab-description-below">${description}</div>` : ''}
      </div>
    `;
  }).join('');
  
  mainTabsContainer.innerHTML = tabsHTML;
  
  // Add click event listeners for expandable descriptions
  initExpandableDescriptions();
}

// Initialize expandable description functionality
function initExpandableDescriptions() {
  document.querySelectorAll('.tab-description-below').forEach(description => {
    description.addEventListener('click', function() {
      this.classList.toggle('expanded');
    });
  });
}

function buildSubFilters() {
  // Remove existing subcategory containers
  const subcategoryWrapper = document.querySelector('.subcategory-wrapper');
  if (!subcategoryWrapper) return;
  
  // Clear existing containers
  subcategoryWrapper.innerHTML = '';
  
  // Create containers for each main category
  mainCategories.forEach((cat) => {
    const isVisible = cat.slug === currentMain;
    const container = document.createElement('div');
    container.className = `filters sub-filters${isVisible ? '' : ' hidden'}`;
    container.id = `subFilters${cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1)}`;
    container.setAttribute('aria-label', `${currentLang === 'ar' && cat.title_ar ? cat.title_ar : cat.title_en} Subcategories`);
    
    if (SUBCATS[cat.slug]) {
      container.innerHTML = SUBCATS[cat.slug].map((c,i)=>{
        const translatedText = translateSubcategory(c);
        return `<button class="filter-btn${i===0?' active':''}" data-sub="${c}" data-main="${cat.slug}">${translatedText}</button>`;
      }).join('');
    }
    
    subcategoryWrapper.appendChild(container);
  });
  
  // Attach listeners to all subcategory containers
  subcategoryWrapper.addEventListener('click', e => {
    if (e.target.matches('.filter-btn')) {
      const container = e.target.closest('.sub-filters');
      container.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      e.target.classList.add('active');
      currentSub = e.target.dataset.sub;
      renderProducts();
    }
  });
}

// Helper function to translate subcategory names
function translateSubcategory(subcat) {
  if (currentLang === 'en') return capitalizeWords(subcat);
  const key = `subcat.${subcat}`;
  const map = translations[currentLang];
  return map && map[key] ? map[key] : capitalizeWords(subcat);
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
      
      // Hide all subcategory containers
      document.querySelectorAll('.sub-filters').forEach(container => {
        container.classList.add('hidden');
      });
      
      // Show the container for current main category
      const activeContainer = document.getElementById(`subFilters${currentMain.charAt(0).toUpperCase() + currentMain.slice(1)}`);
      if (activeContainer) {
        activeContainer.classList.remove('hidden');
        // Reset active button to 'all'
        activeContainer.querySelectorAll('.filter-btn').forEach((b,i)=>{b.classList.toggle('active', i===0);});
      }
      
      renderProducts();
    });
  });
}

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
    const map = translations[currentLang];
    
    if (!input.value.trim()) {
      valid = false;
      errorEl.textContent = map && map['contact.required'] ? map['contact.required'] : 'Required';
    } else if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      valid = false;
      errorEl.textContent = map && map['contact.invalidEmail'] ? map['contact.invalidEmail'] : 'Invalid email';
    } else {
      errorEl.textContent = '';
    }
  });
  if (valid) {
    const map = translations[currentLang];
    status.textContent = map && map['contact.success'] ? map['contact.success'] : 'Message sent (demo). We will reply soon!';
    form.reset();
    setTimeout(() => (status.textContent = ''), 4000);
  } else {
    const map = translations[currentLang];
    status.textContent = map && map['contact.error'] ? map['contact.error'] : 'Please correct errors above.';
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

// Comprehensive translations object
const translations = {
  ar: {
    // Navigation
    'nav.home':'الرئيسية','nav.about':'من نحن','nav.products':'المنتجات','nav.events':'الفعاليات',
    'nav.services':'الخدمات','nav.faq':'الأسئلة','nav.contact':'اتصل بنا','nav.navigation':'القائمة',
    
    // Hero Section
    'hero.explore':'استكشف الكتالوج',
    
    // Sections
    'featured.title':'المنتجات المميزة','featured.badge':'مميز',
    'bestsellers.title':'الأكثر مبيعاً',
    'newArrivals.title':'وصل حديثاً',
    'seasonal.title':'عروض موسمية',
    
    // About Section
    'about.title':'قصتنا',
    'about.authentic':'وصفات أصيلة',
    'about.natural':'مكونات طبيعية',
    'about.handcrafted':'جودة يدوية الصنع',
    'about.sustainable':'مصادر مستدامة',
    
    // Products Section
    'products.title':'منتجاتنا',
    'products.intro':'تصفح فئات منتجاتنا اللبنانية. كل صنف يتضمن وصفاً ومكونات (بدون أسعار)',
    'products.all':'الكل',
    'products.ingredients':'المكونات:',
    'products.variants':'الأحجام:',
    'products.tags':'الوسوم',
    
    // Contact Section
    'contact.title':'اتصل بنا',
    'contact.name':'الاسم',
    'contact.email':'البريد الإلكتروني',
    'contact.message':'الرسالة',
    'contact.send':'إرسال الرسالة',
    'contact.info':'معلومات الشركة',
    'contact.namePlaceholder':'اسمك',
    'contact.emailPlaceholder':'you@example.com',
    'contact.messagePlaceholder':'اكتب رسالتك...',
    'contact.email.label':'البريد:',
    'contact.phone.label':'الهاتف:',
    'contact.location.label':'الموقع:',
    'contact.social':'تابعنا على وسائل التواصل:',
    'contact.facebook':'فيسبوك',
    'contact.instagram':'إنستغرام',
    'contact.twitter':'تويتر',
    'contact.required':'مطلوب',
    'contact.invalidEmail':'بريد إلكتروني غير صالح',
    'contact.success':'تم إرسال الرسالة (تجريبي). سنرد قريباً!',
    'contact.error':'يرجى تصحيح الأخطاء أعلاه.',
    
    // Footer
    'footer.tagline':'منتجات لبنانية أصيلة مصنوعة يدوياً ومعلبة. تقليد محفوظ في كل برطمان.',
    'footer.home':'الرئيسية',
    'footer.about':'من نحن',
    'footer.products':'المنتجات',
    'footer.events':'الفعاليات',
    'footer.services':'الخدمات',
    'footer.faq':'الأسئلة',
    'footer.contact':'اتصل بنا',
    'footer.email':'البريد:',
    'footer.phone':'الهاتف:',
    'footer.rights':'كرم لبنان. جميع الحقوق محفوظة.',
    'footer.backToTop':'العودة للأعلى',
    
    // Search
    'search.placeholder':'ابحث عن منتجات',
    'search.open':'فتح البحث',
    'search.close':'إغلاق البحث',
    
    // Modal
    'modal.close':'إغلاق',
    'modal.ingredients':'المكونات',
    'modal.variants':'الأحجام',
    'modal.tags':'الوسوم',
    
    // Subcategories (common ones)
    'subcat.all':'الكل',
    'subcat.fresh veges':'خضار طازجة',
    'subcat.fresh pickles':'مخللات طازجة',
    'subcat.ordinary pickles':'مخللات عادية',
    'subcat.olives':'زيتون',
    'subcat.olive oil':'زيت زيتون',
    'subcat.sunflower oil':'زيت دوار الشمس',
    'subcat.labne & kishik':'لبنة وكشك',
    'subcat.kishik':'كشك',
    'subcat.pastes':'معجون',
    'subcat.molases':'دبس',
    'subcat.hydrosols':'ماء الورد والزهر',
    'subcat.natural syrubs':'شراب طبيعي',
    'subcat.tahhene':'طحينة',
    'subcat.vinegar':'خل',
    'subcat.herbal':'أعشاب',
    'subcat.kamar el din':'قمر الدين',
    'subcat.ready to serve':'جاهز للتقديم'
  }
};
let currentLang = 'en';

// Helper functions for localized content
function getLocalizedText(item, field) {
  if (currentLang === 'ar' && item[`${field}_ar`]) {
    return item[`${field}_ar`];
  }
  return item[`${field}_en`] || item[field] || '';
}

function getLocalizedArray(item, field) {
  if (currentLang === 'ar' && item[`${field}_ar`] && item[`${field}_ar`].length > 0) {
    return item[`${field}_ar`];
  }
  return item[field] || [];
}

const langBtn = document.getElementById('langToggle');
langBtn?.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  langBtn.textContent = currentLang === 'en' ? 'AR' : 'EN';
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;
  document.body.classList.toggle('rtl', currentLang==='ar');
  
  applyTranslations();
  buildMainTabs();
  buildSubFilters();
  initMainTabs();
  
  // Re-render all product sections with new language
  renderProducts();
  renderFeatured();
  renderBestsellers(); 
  renderNewArrivals();
  renderSeasonal();
  renderCustomSections();
});

function applyTranslations() {
  const map = translations[currentLang];
  if (!map) return; // English is default, no translations needed
  
  // Translate all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (map[key]) {
      // Handle different element types
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.placeholder) el.placeholder = map[key];
      } else {
        el.textContent = map[key];
      }
    }
  });
  
  // Special handling for aria-labels
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    if (map[key]) el.setAttribute('aria-label', map[key]);
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
  buildMainTabs();
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
    
    // Load main categories first
    const { data: mainCats, error: mainCatsErr } = await client.from('main_categories').select('*').eq('active', true).order('sort_order');
    if (mainCatsErr && /not found/i.test(mainCatsErr.message)) {
      console.warn('Supabase table main_categories not found. Using default categories.');
    }
    if (mainCats?.length) {
      mainCategories = mainCats;
    }
    
    // Load subcategories
    const { data: subs, error: subsErr } = await client.from('subcategories').select('*').eq('active', true).order('sort_order');
    if (subsErr && /not found/i.test(subsErr.message)) {
      console.warn('Supabase table subcategories not found. Did you run the migration? Skipping remote load.');
      return; // abort further remote attempts
    }
    if (subs?.length){
      // Reset SUBCATS and rebuild based on available main categories
      Object.keys(SUBCATS).forEach(key => {
        if (!mainCategories.some(cat => cat.slug === key)) {
          delete SUBCATS[key];
        }
      });
      
      // Build subcategory lists for each main category
      mainCategories.forEach(mainCat => {
        if (!SUBCATS[mainCat.slug]) {
          SUBCATS[mainCat.slug] = ['all'];
        }
        const categorySubs = subs.filter(s => s.category_type === mainCat.slug).map(s => s.slug.replace(/-/g,' '));
        if (categorySubs.length > 0) {
          SUBCATS[mainCat.slug] = ['all', ...categorySubs];
        }
      });
      
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
          name_en: p.name_en || 'Unnamed',
          name_ar: p.name_ar || p.name_en || 'Unnamed',
          category: p.sub_slug || 'general',
          mainType: p.main_type,
          sub: (p.sub_slug || '').replace(/-/g,' '),
          featured: !!p.featured, // Use database featured field
          sections: sections, // Add sections array for filtering
          image: p.image_url || FALLBACK_IMAGE,
          description_en: p.description_en || '',
          description_ar: p.description_ar || p.description_en || '',
          ingredients: Array.isArray(p.ingredients)? p.ingredients : [],
          ingredients_ar: Array.isArray(p.ingredients_ar) ? p.ingredients_ar : (Array.isArray(p.ingredients) ? p.ingredients : []),
          variants: Array.isArray(p.variants) ? p.variants : [], // Add variants field
          variants_ar: Array.isArray(p.variants_ar) ? p.variants_ar : (Array.isArray(p.variants) ? p.variants : []),
          tags: Array.isArray(p.tags) ? p.tags : [], // Add tags field
          tags_ar: Array.isArray(p.tags_ar) ? p.tags_ar : (Array.isArray(p.tags) ? p.tags : []),
          sort_order: p.sort_order ?? 999 // Add sort_order field with fallback
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
      const fixedSections = ['hero', 'about', 'products'];
      const contactSection = sections.find(s => s.key === 'contact');
      
      // Process fixed sections first (hero, about, products)
      fixedSections.forEach(key => {
        const section = sections.find(s => s.key === key);
        if (section) {
          if (section.key === 'hero') {
            SITE_OVERRIDES.hero = { title: section.title_en, lead: section.body_en, image: section.image_url };
          }
          if (section.key === 'about') {
            SITE_OVERRIDES.about = { 
              heading: section.title_en, 
              text: section.body_en ? [section.body_en] : [], 
              image: section.image_url,
              fullContent: section.body_en // Store full HTML content
            };
          }
          if (section.key === 'products') {
            SITE_OVERRIDES.products = { title: section.title_en, intro: section.content_en };
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

// Generate overlay CSS based on section data
function generateOverlayCSS(sectionData) {
  const type = sectionData.overlay_type || 'linear';
  const opacity = (sectionData.overlay_opacity || 40) / 100;
  const primary = sectionData.overlay_primary_color || '#29241d';
  const secondary = sectionData.overlay_secondary_color || '#29241d';
  
  // Convert hex to rgba
  function hexToRgba(hex, alpha) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(41, 36, 29, ${alpha})`;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  const primaryRgba = hexToRgba(primary, opacity);
  const secondaryRgba = hexToRgba(secondary, opacity);
  
  switch(type) {
    case 'solid':
      return primaryRgba;
    case 'radial':
      return `radial-gradient(circle, ${primaryRgba}, ${secondaryRgba})`;
    case 'linear':
    default:
      return `linear-gradient(${primaryRgba}, ${secondaryRgba})`;
  }
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
    
    // Update hero background image and overlay if provided
    if (sectionData.image_url) {
      // Generate overlay CSS based on section data
      const overlayCSS = generateOverlayCSS(sectionData);
      section.style.backgroundImage = `${overlayCSS}, url('${sectionData.image_url}')`;
    } else if (sectionData.overlay_type || sectionData.overlay_opacity || sectionData.overlay_primary_color) {
      // Update overlay even without changing image
      const overlayCSS = generateOverlayCSS(sectionData);
      const currentBg = section.style.backgroundImage || getComputedStyle(section).backgroundImage;
      const imageMatch = currentBg.match(/url\([^)]+\)/);
      if (imageMatch) {
        section.style.backgroundImage = `${overlayCSS}, ${imageMatch[0]}`;
      }
    }
  } else if (sectionKey === 'products') {
    // For products section, update the intro paragraph
    const introElement = section.querySelector('.section-intro');
    if (introElement && sectionData.content_en) {
      introElement.textContent = sectionData.content_en;
    }
  } else if (sectionKey === 'contact') {
    // For contact section, update the contact-info content
    const contactInfo = section.querySelector('.contact-info');
    if (contactInfo && sectionData.body_en) {
      // Keep the h3 title, replace the content after it
      const h3 = contactInfo.querySelector('h3');
      contactInfo.innerHTML = (h3 ? h3.outerHTML : '<h3>Company Info</h3>') + sectionData.body_en;
    }
  } else if (sectionKey === 'about') {
    // For about section, replace the entire content div with full HTML
    const contentDiv = section.querySelector('.container > .grid > div:first-child');
    if (contentDiv && sectionData.body_en) {
      // Keep the title, replace everything else
      const title = contentDiv.querySelector('h2');
      const titleHTML = title ? title.outerHTML : `<h2 id="aboutHeading" class="section-title">${sectionData.title_en}</h2>`;
      contentDiv.innerHTML = titleHTML + sectionData.body_en;
    }
    
    // Update the image if provided
    if (sectionData.image_url) {
      const img = section.querySelector('.about-image-wrapper img, .about-image');
      if (img) img.src = sectionData.image_url;
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

// Product card click handler (event delegation)
document.addEventListener('click', (e) => {
  const card = e.target.closest('.card[data-product-id]');
  if (card) {
    const productId = parseInt(card.dataset.productId);
    const product = productsData.find(p => p.id === productId);
    if (product) {
      openProductModal(product);
    }
  }
});

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

// Product Detail Modal Functions
function openProductModal(item) {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  
  // Get localized data
  const name = getLocalizedText(item, 'name');
  const description = getLocalizedText(item, 'description');
  const ingredients = getLocalizedArray(item, 'ingredients');
  const variants = getLocalizedArray(item, 'variants');
  const tags = getLocalizedArray(item, 'tags');
  
  // Build modal content
  const modalImage = modal.querySelector('.modal-image img');
  const modalTitle = modal.querySelector('.modal-title');
  const modalDescription = modal.querySelector('.modal-description');
  const ingredientsSection = modal.querySelector('#modalIngredients');
  const variantsSection = modal.querySelector('#modalVariants');
  const tagsSection = modal.querySelector('#modalTags');
  
  const map = translations[currentLang];
  const ingredientsLabel = map && map['modal.ingredients'] ? map['modal.ingredients'] : 'Ingredients';
  const variantsLabel = map && map['modal.variants'] ? map['modal.variants'] : 'Variants';
  const tagsLabel = map && map['modal.tags'] ? map['modal.tags'] : 'Tags';
  
  if (modalImage) modalImage.src = item.image;
  if (modalTitle) modalTitle.textContent = name;
  if (modalDescription) modalDescription.textContent = description;
  
  // Ingredients
  if (ingredientsSection) {
    if (ingredients.length > 0) {
      ingredientsSection.innerHTML = `
        <div class="modal-section-title">${ingredientsLabel}</div>
        <div class="modal-list">${ingredients.join(', ')}</div>
      `;
      ingredientsSection.style.display = 'block';
    } else {
      ingredientsSection.style.display = 'none';
    }
  }
  
  // Variants
  if (variantsSection) {
    if (variants.length > 0) {
      variantsSection.innerHTML = `
        <div class="modal-section-title">${variantsLabel}</div>
        <div class="modal-list">${variants.join(', ')}</div>
      `;
      variantsSection.style.display = 'block';
    } else {
      variantsSection.style.display = 'none';
    }
  }
  
  // Tags
  if (tagsSection) {
    if (tags.length > 0) {
      tagsSection.innerHTML = `
        <div class="modal-section-title">${tagsLabel}</div>
        <div class="modal-tags">${tags.map(tag => `<span class="modal-tag">${tag}</span>`).join('')}</div>
      `;
      tagsSection.style.display = 'block';
    } else {
      tagsSection.style.display = 'none';
    }
  }
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal on close button click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
    closeProductModal();
  }
});

// Close modal on background click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('productModal');
  if (modal && e.target === modal) {
    closeProductModal();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('productModal');
    if (modal && modal.classList.contains('active')) {
      closeProductModal();
    }
  }
});

// Accessibility: trap focus when menu open (simplified)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navList.classList.contains('open')) {
    navList.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.focus();
  }
});
