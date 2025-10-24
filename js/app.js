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
let navigationInitialized = false;
function initializeNavigation() {
  if (navigationInitialized) return; // Prevent duplicate initialization
  
  // Navigation toggle with sidebar and overlay
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  const navOverlay = document.getElementById('navOverlay');
  
  if (!navToggle || !navList || !navOverlay) {
    console.warn('Navigation elements not found, retrying in 100ms...');
    setTimeout(initializeNavigation, 100);
    return;
  }

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
  
  // Mark navigation as initialized
  navigationInitialized = true;
}

// Search initialization with debouncing and performance improvements
let searchTimeout;
let searchInitialized = false;
function initializeSearch() {
  if (searchInitialized) return; // Prevent duplicate initialization
  
  const searchInput = document.getElementById('productSearch');
  const searchInputDesktop = document.getElementById('productSearchDesktop');
  
  if (!searchInput || !searchInputDesktop) {
    console.warn('Search elements not found, retrying in 100ms...');
    setTimeout(initializeSearch, 100);
    return;
  }

  // Debounced search function to reduce lag
  function performSearch(inputElement) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const hasValue = !!inputElement.value.trim();
      document.body.classList.toggle('searching', hasValue);
      renderProducts();
    }, 150); // 150ms debounce delay
  }

  // Handle mobile search with debouncing
  searchInput?.addEventListener('input', () => {
    performSearch(searchInput);
  });

  // Handle desktop search with debouncing
  searchInputDesktop?.addEventListener('input', () => {
    performSearch(searchInputDesktop);
  });

  // Search toggle functionality for mobile
  const searchToggle = document.getElementById('searchToggle');
  searchToggle?.addEventListener('click', () => {
    const isExpanded = searchInput.classList.contains('expanded');
    if (isExpanded) {
      // Closing search
      searchInput.classList.remove('expanded');
      searchInput.value = '';
      document.body.classList.remove('searching');
      clearTimeout(searchTimeout);
      renderProducts();
    } else {
      // Opening search
      searchInput.classList.add('expanded');
      // Reduced animation wait time for better UX
      setTimeout(() => {
        searchInput.focus();
        searchInput.select(); // Select any existing text
      }, 200);
    }
  });

  // Search toggle functionality for desktop
  const searchToggleDesktop = document.getElementById('searchToggleDesktop');
  searchToggleDesktop?.addEventListener('click', () => {
    const isExpanded = searchInputDesktop.classList.contains('expanded');
    if (isExpanded) {
      // Closing search
      searchInputDesktop.classList.remove('expanded');
      searchInputDesktop.value = '';
      document.body.classList.remove('searching');
      clearTimeout(searchTimeout);
      renderProducts();
    } else {
      // Opening search
      searchInputDesktop.classList.add('expanded');
      // Reduced animation wait time for better UX
      setTimeout(() => {
        searchInputDesktop.focus();
        searchInputDesktop.select(); // Select any existing text
      }, 200);
    }
  });

  // Handle escape key to close search
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (searchInput?.classList.contains('expanded')) {
        searchToggle?.click();
      }
      if (searchInputDesktop?.classList.contains('expanded')) {
        searchToggleDesktop?.click();
      }
    }
  });
  
  // Mark search as initialized
  searchInitialized = true;
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

// Render all products with optimized performance
let currentMain = '';  // Will be set dynamically to first available main category
let currentSub = 'all';
let renderTimeout;

function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  
  // Clear any pending render to avoid multiple renders
  clearTimeout(renderTimeout);
  
  // Cache search term to avoid multiple DOM queries
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

  // For search results, render immediately without skeleton for better responsiveness
  if (searchTerm) {
    grid.innerHTML = items.map(p => cardTemplate(p)).join('');
    attachImageFallbacks();
    observeFadeIns();
  } else {
    // For category browsing, use minimal skeleton delay for perceived performance
    grid.innerHTML = items.map(()=>'<div class="card skeleton" style="height:260px;border-radius:10px;background:var(--color-light);animation:pulse 1.5s ease-in-out infinite;"></div>').join('');
    renderTimeout = setTimeout(() => { 
      grid.innerHTML = items.map(p => cardTemplate(p)).join(''); 
      attachImageFallbacks(); 
      observeFadeIns(); 
    }, 40); // Reduced from 80ms to 40ms
  }
  
  updateBanner();
}

function updateBanner() {
  const banner = document.getElementById('categoryBanner');
  if (!banner) return;
  // Get current main category data
  const currentMainCategory = mainCategories.find(c => c.slug === currentMain);
  
  // Determine banner key - for 'all' subcategory, look for category-specific banner first
  let key;
  if (currentSub === 'all') {
    key = `${currentMain}-all`; // Look for category-specific "All" banner first
    if (!BANNERS[key]) {
      key = 'default'; // Fallback to default if no category-specific "All" banner
    }
  } else {
    key = currentSub;
  }
  
  banner.style.backgroundImage = `url('${BANNERS[key] || BANNERS.default}')`;
  
  // Only show text content for specific subcategories, not for "All"
  if (currentSub === 'all') {
    // For "All" - show only the banner image, no text content
    banner.innerHTML = '';
  } else {
    // For specific subcategories - show subcategory name
    const bannerText = translateSubcategory(currentSub);
    banner.innerHTML = `
      <div class="banner-content">
        <span class="banner-title">${bannerText}</span>
      </div>
    `;
  }
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
  
  // Generate main category tabs dynamically with localized titles
  const tabsHTML = mainCategories.map((cat, index) => {
    const isActive = cat.slug === currentMain;
    const title = currentLang === 'ar' && cat.title_ar ? cat.title_ar : cat.title_en;
    
    return `<button role="tab" aria-selected="${isActive}" class="main-cat-tab${isActive ? ' active' : ''}" data-main="${cat.slug}">${title}</button>`;
  }).join('');
  
  // Generate descriptions separately in a full-width container
  const descriptionsHTML = mainCategories.map((cat, index) => {
    const isActive = cat.slug === currentMain;
    const description = currentLang === 'ar' && cat.description_ar ? cat.description_ar : cat.description_en || '';
    
    return description ? `<div class="tab-description-below${isActive ? '' : ' hidden'}" data-category="${cat.slug}">${description}</div>` : '';
  }).join('');
  
  mainTabsContainer.innerHTML = `
    <div class="tabs-row">
      ${mainCategories.map((cat, index) => {
        const isActive = cat.slug === currentMain;
        const title = currentLang === 'ar' && cat.title_ar ? cat.title_ar : cat.title_en;
        
        return `
          <div class="tab-container">
            <button role="tab" aria-selected="${isActive}" class="main-cat-tab${isActive ? ' active' : ''}" data-main="${cat.slug}">${title}</button>
          </div>
        `;
      }).join('')}
    </div>
    <div class="descriptions-container">
      ${descriptionsHTML}
    </div>
  `;
  
  // Add click event listeners for expandable descriptions
  initExpandableDescriptions();
}

// Initialize expandable description functionality
function initExpandableDescriptions() {
  document.querySelectorAll('.tab-description-below').forEach(description => {
    description.addEventListener('click', function() {
      // Only toggle if the description is visible (not hidden)
      if (!this.classList.contains('hidden')) {
        this.classList.toggle('expanded');
      }
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
        // Only make first button active if this container is visible
        const isActive = isVisible && i === 0;
        return `<button class="filter-btn${isActive ? ' active' : ''}" data-sub="${c}" data-main="${cat.slug}">${translatedText}</button>`;
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
  // Handle 'all' category
  if (subcat === 'all') {
    if (currentLang === 'ar') {
      const map = translations[currentLang];
      return map && map['subcat.all'] ? map['subcat.all'] : 'الكل';
    }
    return 'All';
  }
  
  // Try to find subcategory in database first
  if (window.subcategoriesData) {
    const subcatSlug = subcat.replace(/\s+/g, '-'); // Convert back to slug format
    const subcatData = window.subcategoriesData.find(s => s.slug === subcatSlug);
    
    if (subcatData) {
      if (currentLang === 'ar' && subcatData.title_ar) {
        return subcatData.title_ar;
      }
      if (subcatData.title_en) {
        return subcatData.title_en;
      }
    }
  }
  
  // Fallback to hardcoded translations
  if (currentLang === 'ar') {
    const key = `subcat.${subcat}`;
    const map = translations[currentLang];
    if (map && map[key]) {
      return map[key];
    }
  }
  
  // Final fallback to capitalized subcat name
  return capitalizeWords(subcat);
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
      
      // Hide all category descriptions
      document.querySelectorAll('.tab-description-below').forEach(desc => {
        desc.classList.add('hidden');
      });
      
      // Show the description for current main category
      const activeDescription = document.querySelector(`.tab-description-below[data-category="${currentMain}"]`);
      if (activeDescription) {
        activeDescription.classList.remove('hidden');
      }
      
      // Hide all subcategory containers and show only the current one
      document.querySelectorAll('.sub-filters').forEach(container => {
        container.classList.add('hidden');
      });
      
      // Show subcategories for current main category
      const activeContainer = document.getElementById(`subFilters${currentMain.charAt(0).toUpperCase() + currentMain.slice(1)}`);
      if (activeContainer) {
        activeContainer.classList.remove('hidden');
        // Reset active button to 'all' (first button)
        activeContainer.querySelectorAll('.filter-btn').forEach((b,i)=>{b.classList.toggle('active', i===0);});
      }
      
      // Reset currentSub to 'all' when switching main categories
      currentSub = 'all';
      
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
// Load saved language preference or default to English
let currentLang = localStorage.getItem('preferredLanguage') || 'en';

// Helper functions for localized content
function getLocalizedText(item, field) {
  const arField = `${field}_ar`;
  const enField = `${field}_en`;
  
  if (currentLang === 'ar' && item[arField]) {
    return item[arField];
  }
  
  return item[enField] || item[field] || '';
}

function getLocalizedArray(item, field) {
  if (currentLang === 'ar' && item[`${field}_ar`] && item[`${field}_ar`].length > 0) {
    return item[`${field}_ar`];
  }
  return item[field] || [];
}

// Language toggle functionality - moved to initialization function
function initializeLanguageToggle() {
  const langBtn = document.getElementById('langToggle');
  const langBtnDesktop = document.getElementById('langToggleDesktop');
  
  if (!langBtn && !langBtnDesktop) {
    console.warn('Language toggle buttons not found. Retrying in 100ms...');
    setTimeout(initializeLanguageToggle, 100);
    return;
  }
  
  // Set initial button text for both buttons
  if (langBtn) langBtn.textContent = currentLang === 'en' ? 'AR' : 'EN';
  if (langBtnDesktop) langBtnDesktop.textContent = currentLang === 'en' ? 'AR' : 'EN';
  
  // Set initial RTL state based on saved language preference
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;
  document.body.classList.toggle('rtl', currentLang === 'ar');
  
  // Function to handle language toggle
  const handleLanguageToggle = () => {
    try {
      currentLang = currentLang === 'en' ? 'ar' : 'en';
      if (langBtn) langBtn.textContent = currentLang === 'en' ? 'AR' : 'EN';
      if (langBtnDesktop) langBtnDesktop.textContent = currentLang === 'en' ? 'AR' : 'EN';
      document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = currentLang;
      document.body.classList.toggle('rtl', currentLang === 'ar');
      
      // Save language preference
      localStorage.setItem('preferredLanguage', currentLang);
      
      applyTranslations();
      
      // Fix for English: manually reset elements that don't get reset by applyTranslations
      if (currentLang === 'en') {
        // Store original English texts if not already stored
        if (!window.originalEnglishTexts) {
          window.originalEnglishTexts = {
            // Hero section
            'hero.explore': 'Explore Catalog',
            
            // Navigation
            'nav.navigation': 'Navigation',
            'nav.home': 'Home',
            'nav.about': 'About',
            'nav.products': 'Products',
            'nav.events': 'Events',
            'nav.services': 'Services',
            'nav.faq': 'F&Q',
            'nav.contact': 'Contact',
            
            // Search
            'search.placeholder': 'Search products',
            
            // Sections
            'featured.title': 'Featured Highlights',
            'bestsellers.title': 'Best Sellers',
            'newArrivals.title': 'New Arrivals',
            'seasonal.title': 'Seasonal Specials',
            'about.title': 'Our Story',
            'about.authentic': 'Authentic Recipes',
            'about.natural': 'Natural Ingredients',
            'about.handcrafted': 'Handcrafted Quality',
            'about.sustainable': 'Sustainable Sourcing',
            'products.title': 'Our Products',
            'products.intro': 'Browse our categories of Lebanese goods. Each item includes a brief description and ingredients. (No prices shown.)',
            
            // Contact form
            'contact.title': 'Contact Us',
            'contact.name': 'Name',
            'contact.email': 'Email', 
            'contact.message': 'Message',
            'contact.send': 'Send Message',
            'contact.info': 'Company Info',
            'contact.email.label': 'Email:',
            'contact.phone.label': 'Phone:',
            'contact.location.label': 'Location:',
            'contact.social': 'Follow us on social media:',
            'contact.facebook': 'Facebook',
            'contact.instagram': 'Instagram',
            'contact.twitter': 'Twitter',
            'contact.namePlaceholder': 'Your Name',
            'contact.emailPlaceholder': 'you@example.com',
            'contact.messagePlaceholder': 'Write your message...',
            
            // Footer
            'footer.tagline': 'Authentic Lebanese homemade & canned products. Tradition preserved in every jar.',
            'footer.home': 'Home',
            'footer.about': 'About',
            'footer.products': 'Products',
            'footer.events': 'Events',
            'footer.services': 'Services',
            'footer.faq': 'F&Q',
            'footer.contact': 'Contact',
            'footer.email': 'Email:',
            'footer.phone': 'Phone:',
            'footer.rights': 'Karam Libnan. All rights reserved.',
            'footer.backToTop': '▲'
          };
        }
        
        // Reset all elements with data-i18n to their original English text
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          if (window.originalEnglishTexts[key]) {
            // Handle different element types
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
              if (el.placeholder) el.placeholder = window.originalEnglishTexts[key];
            } else {
              el.textContent = window.originalEnglishTexts[key];
            }
          }
        });
      }
      
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
      
      // Update all sections with language-appropriate content
      if (window.sectionsData) {
        // First update SITE_OVERRIDES for the new language
        SITE_OVERRIDES = SITE_OVERRIDES || {};
        
        window.sectionsData.forEach(section => {
          // Update SITE_OVERRIDES for specific sections that need it (language-aware)
          const sectionTitle = currentLang === 'ar' ? (section.title_ar || section.title_en) : section.title_en;
          const sectionContent = currentLang === 'ar' ? (section.content_ar || section.content_en) : section.content_en;
          const sectionBody = currentLang === 'ar' ? (section.body_ar || section.body_en) : section.body_en;
          
          if (section.key === 'hero') {
            SITE_OVERRIDES.hero = { 
              title: sectionTitle, 
              lead: sectionBody || sectionContent, 
              image: section.image_url 
            };
          }
          if (section.key === 'about') {
            SITE_OVERRIDES.about = { 
              heading: sectionTitle, 
              text: sectionBody ? [sectionBody] : (sectionContent ? [sectionContent] : []), 
              image: section.image_url,
              fullContent: sectionBody || sectionContent
            };
          }
          if (section.key === 'products') {
            SITE_OVERRIDES.products = { 
              title: sectionTitle, 
              intro: sectionContent || sectionBody 
            };
          }
          
          // Update section content
          updateSectionContent(section.key, section);
        });
        
        // Apply content overrides after updating sections
        applyContentOverrides();
        
        console.log(`🌐 Updated all sections and overrides for language: ${currentLang}`);
      }
      
      console.log(`Language switched to: ${currentLang}`);
    } catch (error) {
      console.error('Error switching language:', error);
    }
  };
  
  // Add event listeners to both buttons
  if (langBtn) langBtn.addEventListener('click', handleLanguageToggle);
  if (langBtnDesktop) langBtnDesktop.addEventListener('click', handleLanguageToggle);
}

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
  
  // Set initial language state
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;
  document.body.classList.toggle('rtl', currentLang === 'ar');
  
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
  
  // Initialize language toggle after everything else is loaded
  initializeLanguageToggle();
  
  // Initialize navigation after DOM is ready
  initializeNavigation();
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
      // Store subcategories data globally for translation
      window.subcategoriesData = subs;
      
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
        
        // Filter subcategories for this main category, excluding virtual "all" entries from database
        const categorySubs = subs
          .filter(s => s.category_type === mainCat.slug && !s.slug.endsWith('-all'))
          .map(s => s.slug.replace(/-/g,' '));
        
        if (categorySubs.length > 0) {
          SUBCATS[mainCat.slug] = ['all', ...categorySubs];
        }
      });
      
      // banners mapping
      subs.forEach(s => { 
        if (s.banner_image_url) {
          // Handle virtual "all" banners - map them to category-specific 'all' key
          if (s.slug.endsWith('-all')) {
            // Extract category from slug (e.g., 'mouneh-all' -> 'mouneh')
            const categorySlug = s.slug.replace('-all', '');
            const bannerKey = `${categorySlug}-all`;
            BANNERS[bannerKey] = s.banner_image_url;
          } else {
            const bannerKey = s.slug.replace(/-/g,' ');
            BANNERS[bannerKey] = s.banner_image_url;
          }
        }
      });
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
    
    console.log('🔍 Loaded sections from database:', sections);
    
    if (sections?.length){
      // Store sections data globally for renderCustomSections to use
      window.sectionsData = sections;
      
      SITE_OVERRIDES = SITE_OVERRIDES || {};
      
      // Process all sections - make them fully editable from admin panel
      // Sort sections by sort_order to maintain proper ordering
      const sortedSections = sections.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      
      console.log('📄 Processing sections:', sortedSections.map(s => s.key));
      
      sortedSections.forEach(section => {
        console.log(`🔧 Processing section: ${section.key}`, section);
        
        // Update SITE_OVERRIDES for specific sections that need it (language-aware)
        const sectionTitle = currentLang === 'ar' ? (section.title_ar || section.title_en) : section.title_en;
        const sectionContent = currentLang === 'ar' ? (section.content_ar || section.content_en) : section.content_en;
        const sectionBody = currentLang === 'ar' ? (section.body_ar || section.body_en) : section.body_en;
        
        if (section.key === 'hero') {
          SITE_OVERRIDES.hero = { 
            title: sectionTitle, 
            lead: sectionBody || sectionContent, 
            image: section.image_url 
          };
        }
        if (section.key === 'about') {
          SITE_OVERRIDES.about = { 
            heading: sectionTitle, 
            text: sectionBody ? [sectionBody] : (sectionContent ? [sectionContent] : []), 
            image: section.image_url,
            fullContent: sectionBody || sectionContent
          };
          console.log('✅ About section SITE_OVERRIDES set:', SITE_OVERRIDES.about);
        }
        if (section.key === 'products') {
          SITE_OVERRIDES.products = { 
            title: sectionTitle, 
            intro: sectionContent || sectionBody 
          };
        }
        
        // Update all section content - now fully editable from admin
        updateSectionContent(section.key, section);
      });
    } else {
      console.warn('⚠️ No sections found in database. About section will show hardcoded content.');
      // Auto-create about section if it doesn't exist
      await createDefaultAboutSection(client);
    }
  } catch(err){ console.warn('Remote load failed', err); }
}

// Auto-create default about section if it doesn't exist
async function createDefaultAboutSection(client) {
  try {
    console.log('🔧 Creating default about section...');
    
    const aboutSectionData = {
      key: 'about',
      title_en: 'Our Story',
      title_ar: 'قصتنا',
      content_en: 'Learn about our heritage and commitment to authentic Lebanese flavors.',
      content_ar: 'تعرف على تراثنا والتزامنا بالنكهات اللبنانية الأصيلة.',
      body_en: `
        <p>Karam Libnan was born from a love for authentic Lebanese flavors passed down through generations. We specialize in homemade and lovingly canned goods that reflect the heart of our land—olive groves, sun-kissed orchards, and mountain herbs.</p>
        <p>Our mission is to preserve tradition while embracing quality and sustainability. Each jar and handcrafted product represents heritage, care, and authenticity.</p>
        <ul class="values-list">
          <li>Authentic Recipes</li>
          <li>Natural Ingredients</li>
          <li>Handcrafted Quality</li>
          <li>Sustainable Sourcing</li>
        </ul>
      `,
      body_ar: `
        <p>وُلد كرم لبنان من حب النكهات اللبنانية الأصيلة المتوارثة عبر الأجيال. نحن متخصصون في المنتجات المنزلية والمعلبة بعناية التي تعكس قلب أرضنا - بساتين الزيتون والبساتين المشمسة والأعشاب الجبلية.</p>
        <p>مهمتنا هي الحفاظ على التقاليد مع احتضان الجودة والاستدامة. كل جرة ومنتج مصنوع يدوياً يمثل التراث والعناية والأصالة.</p>
        <ul class="values-list">
          <li>وصفات أصيلة</li>
          <li>مكونات طبيعية</li>
          <li>جودة مصنوعة يدوياً</li>
          <li>مصادر مستدامة</li>
        </ul>
      `,
      image_url: 'images/ourstory.png',
      sort_order: 1
    };
    
    const { data, error } = await client
      .from('sections')
      .insert([aboutSectionData])
      .select();
    
    if (error) {
      console.error('❌ Failed to create about section:', error);
      return;
    }
    
    console.log('✅ About section created successfully:', data[0]);
    
    // Update the content immediately
    if (data && data[0]) {
      SITE_OVERRIDES = SITE_OVERRIDES || {};
      SITE_OVERRIDES.about = { 
        heading: data[0].title_en, 
        text: [data[0].body_en], 
        image: data[0].image_url,
        fullContent: data[0].body_en
      };
      updateSectionContent('about', data[0]);
      console.log('🔄 About section content updated on page');
    }
    
  } catch (error) {
    console.error('❌ Error creating default about section:', error);
  }
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
  console.log(`🔄 updateSectionContent called for: ${sectionKey} (lang: ${currentLang})`, sectionData);
  
  // Handle hero/home ID mismatch - hero section in HTML has id="home"
  const actualSectionId = sectionKey === 'hero' ? 'home' : sectionKey;
  let section = document.getElementById(actualSectionId);
  
  console.log(`📍 Found section element for ${sectionKey}:`, section);
  
  // Get language-specific content
  const title = currentLang === 'ar' ? (sectionData.title_ar || sectionData.title_en) : sectionData.title_en;
  const content = currentLang === 'ar' ? (sectionData.content_ar || sectionData.content_en) : sectionData.content_en;
  const body = currentLang === 'ar' ? (sectionData.body_ar || sectionData.body_en) : sectionData.body_en;
  
  console.log(`🌐 Language-specific content for ${sectionKey}:`, {
    currentLang,
    title,
    hasContent: !!content,
    hasBody: !!body,
    usingArabic: currentLang === 'ar' && (sectionData.title_ar || sectionData.content_ar || sectionData.body_ar)
  });
  
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
  if (titleElement && title) {
    titleElement.textContent = title;
  }
  
  // Handle different section types
  if (sectionKey === 'hero') {
    // For hero section, update the lead paragraph
    const leadElement = section.querySelector('.lead, .hero-content p');
    if (leadElement && body) {
      leadElement.innerHTML = body;
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
    if (introElement && content) {
      introElement.textContent = content;
    }
  } else if (sectionKey === 'contact') {
    // For contact section, update the contact-info content
    const contactInfo = section.querySelector('.contact-info');
    if (contactInfo && body) {
      // Keep the h3 title, replace the content after it
      const h3 = contactInfo.querySelector('h3');
      contactInfo.innerHTML = (h3 ? h3.outerHTML : '<h3>Company Info</h3>') + body;
    }
  } else if (sectionKey === 'about') {
    console.log('🔧 Updating about section with data:', sectionData);
    
    // For about section, replace the entire content div with full HTML
    const contentDiv = section.querySelector('.container.grid.two-col > div:first-child') || 
                      section.querySelector('.container .grid div:first-child') ||
                      section.querySelector('.grid div:first-child') ||
                      section.querySelector('.container > div:first-child');
    console.log('📍 Found content div:', contentDiv);
    
    if (contentDiv && body) {
      // Keep the title, replace everything else
      const titleElement = contentDiv.querySelector('h2, .section-title');
      const titleHTML = titleElement ? titleElement.outerHTML : `<h2 id="aboutHeading" class="section-title">${title || 'Our Story'}</h2>`;
      
      console.log('🔄 Replacing content with:', titleHTML + body);
      contentDiv.innerHTML = titleHTML + body;
      
      console.log('✅ About section content updated successfully');
    } else {
      console.warn('❌ Could not find content div or body data', {
        contentDiv: !!contentDiv,
        body: !!body,
        sectionData
      });
      
      // Fallback: try to find and update paragraphs directly
      const paragraphs = section.querySelectorAll('p');
      if (paragraphs.length > 0 && body) {
        console.log('🔄 Fallback: updating paragraphs directly');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = body;
        const newParagraphs = tempDiv.querySelectorAll('p, ul');
        
        // Replace existing paragraphs with new content
        paragraphs.forEach((p, index) => {
          if (newParagraphs[index]) {
            p.outerHTML = newParagraphs[index].outerHTML;
          }
        });
      }
    }
    
    // Update the image if provided
    if (sectionData.image_url) {
      const img = section.querySelector('.about-image-wrapper img, .about-image');
      if (img) {
        img.src = sectionData.image_url;
        console.log('🖼️ Updated about section image');
      }
    }
  } else {
    // For other sections, update general content areas
    const bodyElement = section.querySelector('.section-content, .section-text, p:not(.form-status)');
    if (bodyElement && body) {
      bodyElement.innerHTML = body;
    }
  }
  
  // Update section image if exists
  const imageElement = section.querySelector('img:not([src*="maps"])'); // Exclude maps iframe
  if (imageElement && sectionData.image_url) {
    imageElement.src = sectionData.image_url;
    imageElement.alt = title || 'Section image';
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
