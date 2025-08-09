# Karam Libnan Website

Static, responsive catalog website showcasing homemade & canned Lebanese products.

## Structure
- `index.html` – Single-page sections: Home, About, Products, Contact
- `css/styles.css` – Styling (earthy Lebanese aesthetic)
- `js/app.js` – Interactivity (navigation, filters, animations, form handling)
- `images/` – Placeholder for product & brand images
- `favicon.ico` – Placeholder favicon

## Features
- Mobile-first responsive layout
- Product filtering (no pricing)
- Accessible navigation & semantic HTML
- SEO meta tags + Open Graph tags
- Simple client-side form validation
- Smooth fade-in animations (IntersectionObserver)

## Customize
1. Replace placeholder images (currently from via.placeholder.com) in `index.html` & `app.js` product data.
2. Update company story, mission, and contact information in the About & Contact sections.
3. Replace `og:image` and `og:url` meta tags with production values.
4. Add analytics script if needed at end of `<body>`.

## Adding Products
Edit `productsData` array in `js/app.js` with objects:
```
{
  id: 10,
  name: 'Item Name',
  category: 'homemade' | 'canned' | 'herbal' | 'sweets',
  featured: false,
  image: 'images/your-image.jpg',
  description: 'Short description',
  ingredients: ['List', 'Of', 'Ingredients']
}
```

## Development
Just open `index.html` in a browser. Optionally serve with a lightweight server to avoid caching issues.

### Optional local server (PowerShell)
```
python -m http.server 8000
```
Then: http://localhost:8000

## License
All placeholder content. Replace with real brand assets before production deployment.
