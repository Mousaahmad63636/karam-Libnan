/* =============================
   Karam Libnan - Main JS
   Handles: navigation toggle, smooth active link highlighting, product rendering & filtering, simple form validation, intersection animations.
   ============================= */

// Fallback image (shown if external image fails to load)
const FALLBACK_IMAGE = 'https://placehold.co/400x300?text=Image+Unavailable';

const productsData = [
  {
    id: 1,
    name: 'Homemade Fig Jam',
    category: 'homemade',
    featured: true,
  image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&q=80',
    description: 'Rich, slow-cooked fig jam with subtle sweetness.',
    ingredients: ['Figs', 'Organic Cane Sugar', 'Lemon Juice']
  },
  {
    id: 2,
    name: 'Pickled Cucumbers',
    category: 'canned',
    featured: true,
  image: 'https://images.unsplash.com/photo-1621378580334-79a6845bb3e7?auto=format&fit=crop&w=800&q=80',
    description: 'Crisp and tangy traditional Lebanese pickles.',
    ingredients: ['Cucumbers', 'Vinegar', 'Sea Salt', 'Garlic', 'Dill']
  },
  {
    id: 3,
    name: 'Herbal Thyme Blend (Za\'atar)',
    category: 'herbal',
    featured: true,
  image: 'https://silkroadrecipes.com/wp-content/uploads/2020/07/Zaatar-Spice-Blend-square.jpg',
    description: 'Fragrant mountain thyme mix, perfect with olive oil & bread.',
    ingredients: ['Thyme', 'Sesame Seeds', 'Sumac', 'Salt']
  },
  {
    id: 4,
    name: 'Orange Blossom Honey',
    category: 'homemade',
    featured: false,
  image: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=80',
    description: 'Raw honey infused with orange blossom aromas.',
    ingredients: ['Pure Honey', 'Orange Blossom Essence']
  },
  {
    id: 5,
    name: 'Stuffed Vine Leaves',
    category: 'canned',
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
    featured: false,
  image: 'https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=800&q=80',
    description: 'Delicate jam capturing the essence of rose petals.',
    ingredients: ['Rose Petals', 'Sugar', 'Lemon Juice']
  },
  {
    id: 7,
    name: 'Pomegranate Molasses',
    category: 'homemade',
    featured: false,
  image: 'https://www.marthastewart.com/thmb/hqfqo5wjANUxa7VbsaOxqS7xIjk=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/ms-pomegranate-molasses-getty-0b12cb3cd1294ecbb86468a517437d5c.jpg',
    description: 'Thick, tangy reduction ideal for dressings & marinades.',
    ingredients: ['Pomegranate Juice', 'Natural Sugar', 'Lemon']
  },
  {
    id: 8,
    name: 'Spiced Olive Mix',
    category: 'canned',
    featured: false,
  image: 'https://www.olivemypickle.com/cdn/shop/files/PDP-olives_22.png?v=1725545524',
    description: 'Marinated olives with herbs and mild spice.',
    ingredients: ['Olives', 'Olive Oil', 'Herbs', 'Spices']
  },
  {
    id: 9,
    name: 'Carob Molasses',
    category: 'sweets',
    featured: false,
  image: 'https://static.ticimax.cloud/cdn-cgi/image/width=370,quality=85/13473/uploads/urunresimleri/buyuk/bal-pekmezdupnisa-ciftligiharnup-pekme-9-3fb3.png',
    description: 'Natural sweetener with deep caramel-like flavor.',
    ingredients: ['Carob Pods', 'Water']
  }
];

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
  return `<article class="card fade-in" data-category="${item.category}">
    ${isFeatured ? '<span class="badge">Featured</span>' : ''}
    <img src="${item.image}" alt="${item.name} image" loading="lazy" data-original="${item.image}" />
    <div class="card-body">
      <h3 class="card-title">${item.name}</h3>
      <p class="desc">${item.description}</p>
      <div class="ingredients"><strong>Ingredients:</strong> ${item.ingredients.join(', ')}</div>
      <span class="category-tag">${item.category}</span>
    </div>
  </article>`;
}

// Render all products
function renderProducts(filter = 'all') {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const items = productsData.filter(p => filter === 'all' ? true : p.category === filter);
  grid.innerHTML = items.map(p => cardTemplate(p)).join('');
  attachImageFallbacks();
  observeFadeIns();
}

// Filtering buttons
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => btn.addEventListener('click', () => {
  filterButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(btn.dataset.filter);
}));

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

// Initial renders
renderFeatured();
renderProducts();
observeFadeIns();

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
