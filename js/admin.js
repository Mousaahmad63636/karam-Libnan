/* =============================
   Karam Libnan - Admin Panel
   Complete website management system
   ============================= */

class AdminManager {
  constructor() {
    this.supabase = null;
    this.currentUser = null;
    this.currentSection = 'dashboard';
    this.editingItem = null;
    
    // Storage configuration
    this.STORAGE_BUCKET = 'karamlebnanbucket';
    this.MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB
    
    this.init();
  }

  // ==================== INITIALIZATION ====================
  async init() {
    console.log('Initializing Admin Panel...');
    
    // Initialize Supabase
    const SUPABASE_URL = document.querySelector('meta[name="supabase-url"]')?.content;
    const SUPABASE_ANON_KEY = document.querySelector('meta[name="supabase-anon-key"]')?.content;
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      this.showError('Supabase configuration missing');
      return;
    }

    this.supabase = window.supabase;
    if (!this.supabase) {
      this.showError('Supabase client not available');
      return;
    }

    // Setup event listeners
    this.setupEventListeners();
    
    // Check authentication
    await this.checkSession();
    
    console.log('Admin Panel initialized');
  }

  setupEventListeners() {
    // Navigation
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-section]')) {
        e.preventDefault();
        this.showSection(e.target.dataset.section);
      }
      
      if (e.target.matches('[data-action]')) {
        e.preventDefault();
        this.handleAction(e.target.dataset.action, e.target);
      }
    });

    // Forms
    document.addEventListener('submit', (e) => {
      if (e.target.matches('[data-form]')) {
        e.preventDefault();
        this.handleFormSubmit(e.target);
      }
    });

    // File uploads
    document.addEventListener('change', (e) => {
      if (e.target.matches('input[type="file"]')) {
        this.handleFilePreview(e.target);
      }
    });

    // Search
    document.addEventListener('input', (e) => {
      if (e.target.matches('[data-search]')) {
        this.handleSearch(e.target);
      }
    });
  }

  // ==================== AUTHENTICATION ====================
  async checkSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        this.currentUser = session.user;
        this.showDashboard();
        this.updateUserInfo();
      } else {
        this.showLogin();
      }
    } catch (error) {
      console.error('Session check failed:', error);
      this.showLogin();
    }
  }

  async handleLogin(email, password) {
    try {
      this.showStatus('Signing in...', 'login');
      
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      this.currentUser = data.user;
      this.showSuccess('Login successful!', 'login');
      this.showDashboard();
      this.updateUserInfo();
      
    } catch (error) {
      this.showError(error.message, 'login');
    }
  }

  async handleLogout() {
    try {
      await this.supabase.auth.signOut();
      this.currentUser = null;
      this.showLogin();
    } catch (error) {
      this.showError('Logout failed: ' + error.message);
    }
  }

  // ==================== UI MANAGEMENT ====================
  showLogin() {
    this.hideAllSections();
    document.getElementById('authPanel').classList.remove('hidden');
    document.getElementById('sidebar').classList.add('hidden');
    document.getElementById('topbar').classList.add('hidden');
  }

  showDashboard() {
    document.getElementById('authPanel').classList.add('hidden');
    document.getElementById('sidebar').classList.remove('hidden');
    document.getElementById('topbar').classList.remove('hidden');
    this.showSection('dashboard');
    this.loadDashboardStats();
    
    // Initialize default sections if needed
    this.initializeDefaultSections();
  }

  showSection(sectionName) {
    console.log('Showing section:', sectionName);
    this.currentSection = sectionName;
    this.hideAllSections();
    
    // Update navigation
    document.querySelectorAll('[data-section]').forEach(el => {
      el.classList.toggle('active', el.dataset.section === sectionName);
    });
    
    // Update topbar title
    const topbarTitle = document.querySelector('#topbar h1');
    if (topbarTitle) {
      const titles = {
        dashboard: 'Dashboard',
        products: 'Products Management',
        subcategories: 'Categories Management',
        sections: 'Content Sections',
        colors: 'Color Settings',
        media: 'Media Management'
      };
      topbarTitle.textContent = titles[sectionName] || 'Admin Panel';
    }
    
    // Show section by removing hidden class
    const section = document.getElementById(`section-${sectionName}`);
    console.log('Found section element:', section);
    if (section) {
      section.classList.remove('hidden');
      // Add small delay to ensure DOM is ready
      setTimeout(() => {
        this.loadSectionData(sectionName);
      }, 100);
    } else {
      console.error(`Section not found: section-${sectionName}`);
    }
  }

  hideAllSections() {
    document.querySelectorAll('[id^="section-"]').forEach(el => {
      el.classList.add('hidden');
    });
  }

  updateUserInfo() {
    const userEmail = document.getElementById('userEmail');
    if (userEmail && this.currentUser) {
      userEmail.textContent = this.currentUser.email;
    }
  }

  // ==================== DATA LOADING ====================
  async loadSectionData(section) {
    console.log('Loading section data for:', section);
    switch (section) {
      case 'dashboard':
        await this.loadDashboardStats();
        break;
      case 'products':
        console.log('Loading products section...');
        await this.loadProducts();
        await this.loadSubcategoriesForDropdown();
        break;
      case 'main-categories':
        await this.loadMainCategories();
        break;
      case 'subcategories':
        console.log('Loading subcategories section...');
        await this.loadSubcategories();
        break;
      case 'sections':
        await this.loadSections();
        break;
      case 'colors':
        await this.loadColorSettings();
        break;
      case 'media':
        await this.loadMedia();
        break;
    }
  }

  async loadDashboardStats() {
    try {
      const [products, mainCategories, subcategories, sections] = await Promise.all([
        this.supabase.from('products').select('id, active, featured'),
        this.supabase.from('main_categories').select('slug, active'),
        this.supabase.from('subcategories').select('slug, active'),
        this.supabase.from('sections').select('key')
      ]);

      const stats = {
        totalProducts: products.data?.length || 0,
        activeProducts: products.data?.filter(p => p.active).length || 0,
        featuredProducts: products.data?.filter(p => p.featured).length || 0,
        totalMainCategories: mainCategories.data?.length || 0,
        totalSubcategories: subcategories.data?.length || 0,
        activeSubcategories: subcategories.data?.filter(s => s.active).length || 0,
        totalSections: sections.data?.length || 0
      };

      this.updateDashboardStats(stats);
      
      // Also check system status
      await this.checkSystemStatus();
      
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  }

  async checkSystemStatus() {
    try {
      const statusEl = document.getElementById('systemStatus');
      if (!statusEl) return;
      
      statusEl.innerHTML = '<p>🔄 Checking system status...</p>';
      
      const results = await this.checkDatabaseTables();
      
      let statusHtml = '<div style="display: grid; gap: 0.5rem;">';
      
      if (results.error) {
        statusHtml += `<div style="color: #dc2626;">❌ Database Error: ${results.error}</div>`;
      } else {
        Object.entries(results).forEach(([table, status]) => {
          const icon = status === 'OK' ? '✅' : '❌';
          const color = status === 'OK' ? '#059669' : '#dc2626';
          statusHtml += `<div style="color: ${color};">${icon} Table "${table}": ${status}</div>`;
        });
      }
      
      // Check storage bucket
      try {
        await this.supabase.storage.from(this.STORAGE_BUCKET).list('', { limit: 1 });
        statusHtml += `<div style="color: #059669;">✅ Storage bucket "${this.STORAGE_BUCKET}": OK</div>`;
      } catch (error) {
        statusHtml += `<div style="color: #dc2626;">❌ Storage bucket "${this.STORAGE_BUCKET}": ${error.message}</div>`;
      }
      
      statusHtml += '</div>';
      statusEl.innerHTML = statusHtml;
      
    } catch (error) {
      const statusEl = document.getElementById('systemStatus');
      if (statusEl) {
        statusEl.innerHTML = `<div style="color: #dc2626;">❌ System check failed: ${error.message}</div>`;
      }
    }
  }

  updateDashboardStats(stats) {
    Object.keys(stats).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        element.textContent = stats[key];
      }
    });
  }

  // ==================== PRODUCTS MANAGEMENT ====================
  async loadProducts(search = '') {
    try {
      console.log('Starting loadProducts with search:', search);
      this.showStatus('Loading products...', 'products');
      
      let query = this.supabase.from('products').select(`
        id, name_en, name_ar, description_en, main_type, sub_slug,
        image_url, featured, active, created_at, updated_at
      `);
      
      if (search) {
        query = query.or(`name_en.ilike.%${search}%,name_ar.ilike.%${search}%`);
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('Products loaded successfully:', data?.length, 'items');
      this.renderProductsTable(data);
      this.clearStatus('products');
      
    } catch (error) {
      console.error('Failed to load products:', error);
      this.showError('Failed to load products: ' + error.message, 'products');
    }
  }

  renderProductsTable(products) {
    console.log('Rendering products table with data:', products?.length, 'items');
    const tbody = document.getElementById('productsTableBody');
    console.log('Table body element found:', !!tbody);
    if (!tbody) {
      console.error('Products table body not found!');
      return;
    }

    tbody.innerHTML = products.map(product => `
      <tr>
        <td>
          ${product.image_url ? `<img src="${product.image_url}" alt="" class="table-thumb">` : ''}
        </td>
        <td>
          <div class="table-title">${product.name_en || ''}</div>
          <div class="table-subtitle">${product.name_ar || ''}</div>
        </td>
        <td>
          <span class="badge badge-${product.main_type}">${product.main_type}</span>
        </td>
        <td>${product.sub_slug || '-'}</td>
        <td>
          <span class="status-indicator ${product.active ? 'active' : 'inactive'}">
            ${product.active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          ${product.featured ? '<span class="featured-star">★</span>' : '-'}
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm" data-action="edit-product" data-id="${product.id}">
              Edit
            </button>
            <button class="btn btn-sm btn-danger" data-action="delete-product" data-id="${product.id}">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    document.getElementById('productCount').textContent = products.length;
  }

  async saveProduct(formData) {
    try {
      this.showStatus('Saving product...', 'products');
      
      const product = this.formDataToObject(formData);
      
      // Extract section assignments
      const selectedSections = formData.getAll('sections');
      console.log('Selected sections:', selectedSections);
      
      // Remove sections from product object (it goes to junction table)
      delete product.sections;
      
      // Handle image upload
      const imageFile = formData.get('image_file');
      if (imageFile && imageFile.size > 0) {
        product.image_url = await this.uploadImage(imageFile, 'products');
      }
      
      let productId;
      
      if (this.editingItem) {
        const { error } = await this.supabase
          .from('products')
          .update(product)
          .eq('id', this.editingItem);
        
        if (error) throw error;
        productId = this.editingItem;
        
        // Delete existing section assignments
        await this.supabase
          .from('product_sections')
          .delete()
          .eq('product_id', productId);
        
      } else {
        const { data, error } = await this.supabase
          .from('products')
          .insert(product)
          .select('id')
          .single();
        
        if (error) throw error;
        productId = data.id;
      }
      
      // Insert new section assignments
      if (selectedSections.length > 0) {
        const sectionInserts = selectedSections.map(sectionKey => ({
          product_id: productId,
          section_key: sectionKey
        }));
        
        console.log('Inserting section assignments:', sectionInserts);
        
        const { error: sectionError } = await this.supabase
          .from('product_sections')
          .insert(sectionInserts);
        
        if (sectionError) {
          console.error('Section insert error:', sectionError);
          throw sectionError;
        }
        
        console.log('Section assignments saved successfully');
      } else {
        console.log('No sections selected');
      }
      
      this.showSuccess(this.editingItem ? 'Product updated successfully!' : 'Product created successfully!', 'products');
      
      if (this.editingItem) {
        // Keep form open for edits and refresh with updated data
        await this.loadProductForEdit(this.editingItem);
      } else {
        // Hide form for new products
        this.hideProductForm();
      }
      
      await this.loadProducts();
      
    } catch (error) {
      this.showError('Failed to save product: ' + error.message, 'products');
    }
  }

  async deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await this.supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      this.showSuccess('Product deleted successfully!', 'products');
      await this.loadProducts();
      
    } catch (error) {
      this.showError('Failed to delete product: ' + error.message, 'products');
    }
  }

  async loadProductForEdit(id) {
    try {
      // Load product data
      const { data: product, error: productError } = await this.supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (productError) throw productError;
      
      // Load product sections
      const { data: sections, error: sectionsError } = await this.supabase
        .from('product_sections')
        .select('section_key')
        .eq('product_id', id);
      
      if (sectionsError) throw sectionsError;
      
      this.editingItem = id;
      
      // Show form first to load section checkboxes
      this.showProductForm(true);
      
      // Wait for sections to load, then populate form
      await this.loadSectionsForCheckboxes();
      
      // Additional small delay to ensure DOM updates
      setTimeout(() => {
        this.populateProductForm(product, sections.map(s => s.section_key));
      }, 50);
      
    } catch (error) {
      this.showError('Failed to load product: ' + error.message, 'products');
    }
  }

  populateProductForm(product, assignedSections = []) {
    const form = document.getElementById('productForm');
    if (!form) return;
    
    // Populate form fields
    Object.keys(product).forEach(key => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = !!product[key];
        } else if (field.type === 'file') {
          // Skip file fields
        } else {
          field.value = product[key] || '';
        }
      }
    });
    
    // Handle special fields
    if (product.ingredients) {
      const ingredientsField = form.querySelector('[name="ingredients"]');
      if (ingredientsField) {
        ingredientsField.value = JSON.stringify(product.ingredients);
      }
    }
    
    // Handle section checkboxes
    console.log('Assigned sections:', assignedSections);
    const sectionCheckboxes = form.querySelectorAll('[name="sections"]');
    console.log('Found section checkboxes:', sectionCheckboxes.length);
    sectionCheckboxes.forEach(checkbox => {
      const isChecked = assignedSections.includes(checkbox.value);
      checkbox.checked = isChecked;
      console.log(`Checkbox ${checkbox.value}: ${isChecked ? 'checked' : 'unchecked'}`);
    });
    
    // Show image preview if available
    if (product.image_url) {
      const preview = document.getElementById('productImagePreview');
      if (preview) {
        preview.src = product.image_url;
        preview.style.display = 'block';
      }
    }
  }

  showProductForm(isEdit = false) {
    const form = document.getElementById('productFormPanel');
    const title = document.getElementById('productFormTitle');
    
    if (form) {
      form.classList.remove('hidden');
      if (title) {
        title.textContent = isEdit ? 'Edit Product' : 'New Product';
      }
    }
    
    // Load subcategories for form
    this.loadSubcategoriesForDropdown();
    
    // Only load sections for new products (edit products load after form shows)
    if (!isEdit) {
      this.loadSectionsForCheckboxes();
    }
  }

  hideProductForm() {
    const form = document.getElementById('productFormPanel');
    if (form) {
      form.classList.add('hidden');
      const productForm = document.getElementById('productForm');
      if (productForm) {
        productForm.reset();
      }
      this.editingItem = null;
    }
  }

  // ==================== SUBCATEGORIES MANAGEMENT ====================
  async loadSubcategories() {
    try {
      console.log('Starting loadSubcategories...');
      this.showStatus('Loading subcategories...', 'subcategories');
      
      const { data, error } = await this.supabase
        .from('subcategories')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      
      console.log('Subcategories loaded successfully:', data?.length, 'items');
      this.renderSubcategoriesTable(data);
      this.clearStatus('subcategories');
      
    } catch (error) {
      console.error('Failed to load subcategories:', error);
      this.showError('Failed to load subcategories: ' + error.message, 'subcategories');
    }
  }

  renderSubcategoriesTable(subcategories) {
    console.log('Rendering subcategories table with data:', subcategories?.length, 'items');
    const tbody = document.getElementById('subcategoriesTableBody');
    console.log('Subcategories table body element found:', !!tbody);
    if (!tbody) {
      console.error('Subcategories table body not found!');
      return;
    }

    tbody.innerHTML = subcategories.map(subcat => `
      <tr>
        <td>
          ${subcat.banner_image_url ? `<img src="${subcat.banner_image_url}" alt="" class="table-thumb">` : ''}
        </td>
        <td>
          <div class="table-title">${subcat.title_en}</div>
          <div class="table-subtitle">${subcat.title_ar || ''}</div>
        </td>
        <td><code>${subcat.slug}</code></td>
        <td>
          <span class="badge badge-${subcat.category_type}">${subcat.category_type}</span>
        </td>
        <td>${subcat.sort_order}</td>
        <td>
          <span class="status-indicator ${subcat.active ? 'active' : 'inactive'}">
            ${subcat.active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm" data-action="edit-subcategory" data-slug="${subcat.slug}">
              Edit
            </button>
            <button class="btn btn-sm btn-danger" data-action="delete-subcategory" data-slug="${subcat.slug}">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    console.log('Subcategories table HTML rendered, innerHTML length:', tbody.innerHTML.length);

    document.getElementById('subcategoryCount').textContent = subcategories.length;
  }

  async loadSubcategoriesForDropdown() {
    try {
      const { data, error } = await this.supabase
        .from('subcategories')
        .select('slug, title_en, category_type')
        .eq('active', true)
        .order('category_type', 'sort_order');
      
      if (error) throw error;
      
      const select = document.getElementById('productSubcategory');
      if (select) {
        select.innerHTML = '<option value="">Select subcategory</option>' +
          data.map(sub => `<option value="${sub.slug}">${sub.title_en} (${sub.category_type})</option>`).join('');
      }
      
    } catch (error) {
      console.error('Failed to load subcategories for dropdown:', error);
    }
  }

  async loadSectionsForCheckboxes() {
    try {
      const { data, error } = await this.supabase
        .from('sections')
        .select('key, title_en')
        .order('sort_order');
      
      if (error) throw error;
      
      const container = document.getElementById('sectionCheckboxes');
      if (container) {
        container.innerHTML = data.map(section => `
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: normal;">
              <input type="checkbox" name="sections" value="${section.key}">
              ${section.title_en || section.key}
            </label>
          </div>
        `).join('');
      }
      
    } catch (error) {
      console.error('Failed to load sections for checkboxes:', error);
    }
  }

  async saveSubcategory(formData) {
    try {
      this.showStatus('Saving subcategory...', 'subcategories');
      
      const subcategory = this.formDataToObject(formData);
      
      // Handle banner image upload
      const bannerFile = formData.get('banner_file');
      if (bannerFile && bannerFile.size > 0) {
        subcategory.banner_image_url = await this.uploadImage(bannerFile, 'banners');
      }
      
      // Check if subcategory exists
      const { data: existing } = await this.supabase
        .from('subcategories')
        .select('slug')
        .eq('slug', subcategory.slug)
        .single();
      
      if (existing) {
        const { error } = await this.supabase
          .from('subcategories')
          .update(subcategory)
          .eq('slug', subcategory.slug);
        
        if (error) throw error;
        this.showSuccess('Subcategory updated successfully!', 'subcategories');
      } else {
        const { error } = await this.supabase
          .from('subcategories')
          .insert(subcategory);
        
        if (error) throw error;
        this.showSuccess('Subcategory created successfully!', 'subcategories');
      }
      
      await this.loadSubcategories();
      await this.loadSubcategoriesForDropdown();
      
    } catch (error) {
      this.showError('Failed to save subcategory: ' + error.message, 'subcategories');
    }
  }

  async deleteSubcategory(slug) {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    
    try {
      const { error } = await this.supabase
        .from('subcategories')
        .delete()
        .eq('slug', slug);
      
      if (error) throw error;
      
      this.showSuccess('Subcategory deleted successfully!', 'subcategories');
      await this.loadSubcategories();
      
    } catch (error) {
      this.showError('Failed to delete subcategory: ' + error.message, 'subcategories');
    }
  }

  // ==================== MAIN CATEGORIES MANAGEMENT ====================
  async loadMainCategories() {
    try {
      this.showStatus('Loading main categories...', 'main-categories');
      
      const { data, error } = await this.supabase
        .from('main_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      this.renderMainCategoriesTable(data);
      this.updateMainCategoryCount(data.length);
      this.clearStatus('main-categories');
      
    } catch (error) {
      this.showError('Failed to load main categories: ' + error.message, 'main-categories');
    }
  }

  renderMainCategoriesTable(categories) {
    const tbody = document.getElementById('mainCategoriesTable');
    if (!tbody) return;

    tbody.innerHTML = categories.map(cat => `
      <tr data-slug="${cat.slug}">
        <td>${cat.title_en || '-'}</td>
        <td>${cat.title_ar || '-'}</td>
        <td><code>${cat.slug}</code></td>
        <td>${cat.sort_order}</td>
        <td>
          <span class="badge ${cat.active ? 'success' : 'error'}">
            ${cat.active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm" data-action="edit-main-category" data-slug="${cat.slug}">
              Edit
            </button>
            <button class="btn btn-outline btn-sm btn-error" data-action="delete-main-category" data-slug="${cat.slug}">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    console.log('Products table HTML rendered, innerHTML length:', tbody.innerHTML.length);
  }

  updateMainCategoryCount(count) {
    const countEl = document.getElementById('mainCategoryCount');
    if (countEl) countEl.textContent = count;
  }

  async saveMainCategory(formData) {
    try {
      this.showStatus('Saving main category...', 'main-categories');
      
      const category = this.formDataToObject(formData);
      
      // Check if this is an update or insert
      const isUpdate = !!category.id;
      
      if (isUpdate) {
        // Update existing
        const { error } = await this.supabase
          .from('main_categories')
          .update({
            title_en: category.title_en,
            title_ar: category.title_ar || null,
            sort_order: parseInt(category.sort_order) || 0,
            active: category.active === 'true'
          })
          .eq('slug', category.slug);
        
        if (error) throw error;
        this.showSuccess('Main category updated successfully!', 'main-categories');
      } else {
        // Insert new
        const { error } = await this.supabase
          .from('main_categories')
          .insert({
            slug: category.slug,
            title_en: category.title_en,
            title_ar: category.title_ar || null,
            sort_order: parseInt(category.sort_order) || 0,
            active: category.active === 'true'
          });
        
        if (error) throw error;
        this.showSuccess('Main category created successfully!', 'main-categories');
      }
      
      this.hideMainCategoryForm();
      await this.loadMainCategories();
      
    } catch (error) {
      this.showError('Failed to save main category: ' + error.message, 'main-categories');
    }
  }

  async deleteMainCategory(slug) {
    if (!confirm('Are you sure you want to delete this main category? This action cannot be undone and may affect products and subcategories.')) return;
    
    try {
      this.showStatus('Deleting main category...', 'main-categories');
      
      const { error } = await this.supabase
        .from('main_categories')
        .delete()
        .eq('slug', slug);
      
      if (error) throw error;
      
      this.showSuccess('Main category deleted successfully!', 'main-categories');
      await this.loadMainCategories();
      
    } catch (error) {
      this.showError('Failed to delete main category: ' + error.message, 'main-categories');
    }
  }

  showMainCategoryForm(slug = null) {
    const form = document.getElementById('mainCategoryForm');
    const title = document.getElementById('mainCategoryFormTitle');
    
    if (!form || !title) return;
    
    form.classList.remove('hidden');
    
    if (slug) {
      title.textContent = 'Edit Main Category';
      this.loadMainCategoryData(slug);
    } else {
      title.textContent = 'Add New Main Category';
      this.clearMainCategoryForm();
    }
  }

  hideMainCategoryForm() {
    const form = document.getElementById('mainCategoryForm');
    if (form) form.classList.add('hidden');
  }

  async loadMainCategoryData(slug) {
    try {
      const { data, error } = await this.supabase
        .from('main_categories')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      
      // Populate form with data
      document.getElementById('mainCategoryId').value = data.slug;
      document.getElementById('mainCategoryTitleEn').value = data.title_en || '';
      document.getElementById('mainCategoryTitleAr').value = data.title_ar || '';
      document.getElementById('mainCategorySlug').value = data.slug || '';
      document.getElementById('mainCategorySortOrder').value = data.sort_order || 0;
      document.getElementById('mainCategoryActive').value = data.active ? 'true' : 'false';
      
      // Make slug readonly for editing
      document.getElementById('mainCategorySlug').readOnly = true;
      
    } catch (error) {
      this.showError('Failed to load main category: ' + error.message, 'main-categories');
    }
  }

  clearMainCategoryForm() {
    document.getElementById('mainCategoryId').value = '';
    document.getElementById('mainCategoryTitleEn').value = '';
    document.getElementById('mainCategoryTitleAr').value = '';
    document.getElementById('mainCategorySlug').value = '';
    document.getElementById('mainCategorySortOrder').value = '0';
    document.getElementById('mainCategoryActive').value = 'true';
    
    // Make slug editable for new categories
    document.getElementById('mainCategorySlug').readOnly = false;
  }

  // ==================== SECTIONS MANAGEMENT ====================
  async loadSections() {
    try {
      this.showStatus('Loading sections...', 'sections');
      
      const { data, error } = await this.supabase
        .from('sections')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      this.renderSectionsTable(data);
      this.clearStatus('sections');
      
    } catch (error) {
      this.showError('Failed to load sections: ' + error.message, 'sections');
    }
  }

  renderSectionsTable(sections) {
    const tbody = document.getElementById('sectionsTableBody');
    if (!tbody) return;

    // Core sections can be edited but not deleted
    const protectedSections = ['hero', 'about', 'contact', 'products'];

    tbody.innerHTML = sections.map(section => `
      <tr>
        <td><code>${section.key}</code></td>
        <td>
          <div class="table-title">${section.title_en || ''}</div>
          <div class="table-subtitle">${section.title_ar || ''}</div>
        </td>
        <td>
          ${section.image_url ? `<img src="${section.image_url}" alt="" class="table-thumb">` : '-'}
        </td>
        <td>${new Date(section.updated_at).toLocaleDateString()}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm" data-action="edit-section" data-key="${section.key}">
              Edit
            </button>
            ${protectedSections.includes(section.key) ? 
              '<span class="text-muted small">Core</span>' : 
              `<button class="btn btn-sm btn-danger" data-action="delete-section" data-key="${section.key}" title="Delete section">Delete</button>`
            }
          </div>
        </td>
      </tr>
    `).join('');

    document.getElementById('sectionCount').textContent = sections.length;
  }

  async saveSection(formData) {
    try {
      this.showStatus('Saving section...', 'sections');
      
      const section = this.formDataToObject(formData);
      
      // Handle image upload
      const imageFile = formData.get('image_file');
      if (imageFile && imageFile.size > 0) {
        section.image_url = await this.uploadImage(imageFile, 'sections');
      }
      
      // Check if section exists
      const { data: existing } = await this.supabase
        .from('sections')
        .select('key')
        .eq('key', section.key)
        .single();
      
      if (existing) {
        const { error } = await this.supabase
          .from('sections')
          .update(section)
          .eq('key', section.key);
        
        if (error) throw error;
        this.showSuccess('Section updated successfully!', 'sections');
      } else {
        const { error } = await this.supabase
          .from('sections')
          .insert(section);
        
        if (error) throw error;
        this.showSuccess('Section created successfully!', 'sections');
      }
      
      await this.loadSections();
      
    } catch (error) {
      this.showError('Failed to save section: ' + error.message, 'sections');
    }
  }

  async deleteSection(sectionKey) {
    // Core sections can be edited but not deleted
    const protectedSections = ['hero', 'about', 'contact', 'products'];
    
    if (protectedSections.includes(sectionKey)) {
      this.showError('Cannot delete core section: ' + sectionKey + '. You can edit it instead.', 'sections');
      return;
    }

    if (!confirm(`Are you sure you want to delete section "${sectionKey}"? This action cannot be undone.`)) {
      return;
    }

    try {
      this.showStatus('Deleting section...', 'sections');
      
      const { error } = await this.supabase
        .from('sections')
        .delete()
        .eq('key', sectionKey);
      
      if (error) throw error;
      
      this.showSuccess('Section deleted successfully!', 'sections');
      await this.loadSections();
      
      // Remove section from frontend if it exists
      const sectionElement = document.getElementById(sectionKey);
      if (sectionElement) {
        sectionElement.remove();
        console.log(`Removed section element: ${sectionKey}`);
      }
      
    } catch (error) {
      this.showError('Failed to delete section: ' + error.message, 'sections');
    }
  }

  // ==================== MEDIA MANAGEMENT ====================
  async uploadImage(file, folder = 'general') {
    if (!file) return null;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }
    
    if (file.size > this.MAX_IMAGE_SIZE) {
      throw new Error('Image file is too large. Maximum size is 4MB');
    }
    
    try {
      // Compress image
      const compressedFile = await this.compressImage(file);
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop().toLowerCase();
      const fileName = `${folder}/${timestamp}_${randomString}.${extension}`;
      
      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(fileName, compressedFile, {
          upsert: false,
          contentType: compressedFile.type
        });
      
      if (error) {
        if (error.message.includes('not found')) {
          throw new Error(`Storage bucket "${this.STORAGE_BUCKET}" not found. Please create it in Supabase Storage.`);
        }
        throw error;
      }
      
      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
      
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }

  async compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // ==================== FORM HANDLING ====================
  async handleFormSubmit(form) {
    const formType = form.dataset.form;
    const formData = new FormData(form);
    
    try {
      switch (formType) {
        case 'login':
          const email = formData.get('email');
          const password = formData.get('password');
          await this.handleLogin(email, password);
          break;
          
        case 'product':
          await this.saveProduct(formData);
          break;
          
        case 'main-category':
          await this.saveMainCategory(formData);
          break;
          
        case 'subcategory':
          await this.saveSubcategory(formData);
          break;
          
        case 'subcategory':
          await this.saveSubcategory(formData);
          break;
          
        case 'section':
          await this.saveSection(formData);
          break;

        case 'import-subcategories':
          await this.importSubcategoriesFromApp();
          break;
      }
    } catch (error) {
      this.showError('Form submission failed: ' + error.message);
    }
  }

  async handleAction(action, element) {
    const id = element.dataset.id;
    const slug = element.dataset.slug;
    const key = element.dataset.key;
    
    try {
      switch (action) {
        case 'logout':
          await this.handleLogout();
          break;
          
        case 'new-product':
          this.editingItem = null;
          document.getElementById('productForm').reset();
          this.showProductForm(false);
          break;
          
        case 'edit-product':
          await this.loadProductForEdit(id);
          break;
          
        case 'delete-product':
          await this.deleteProduct(id);
          break;
          
        case 'cancel-product':
          this.hideProductForm();
          break;

        case 'new-main-category':
          this.showMainCategoryForm();
          break;
          
        case 'edit-main-category':
          this.showMainCategoryForm(slug);
          break;
          
        case 'delete-main-category':
          await this.deleteMainCategory(slug);
          break;
          
        case 'cancel-main-category':
          this.hideMainCategoryForm();
          break;

        case 'new-subcategory':
          this.editingItem = null;
          document.getElementById('subcategoryForm').reset();
          this.showSubcategoryForm(false);
          break;
          
        case 'edit-subcategory':
          await this.loadSubcategoryForEdit(slug);
          break;
          
        case 'delete-subcategory':
          await this.deleteSubcategory(slug);
          break;

        case 'cancel-subcategory':
          this.hideSubcategoryForm();
          break;

        case 'new-section':
          this.editingItem = null;
          document.getElementById('sectionForm').reset();
          this.showSectionForm(false);
          break;
          
        case 'edit-section':
          await this.loadSectionForEdit(key);
          break;

        case 'delete-section':
          await this.deleteSection(key);
          break;

        case 'cancel-section':
          this.hideSectionForm();
          break;

        case 'import-subcategories':
          await this.importSubcategoriesFromApp();
          break;

        case 'check-system':
          await this.checkSystemStatus();
          break;
          
        case 'init-core-sections':
          await this.initializeCoreSections();
          break;
          
        case 'cleanup-sections':
          await this.cleanupSections();
          break;
          
        // Add more actions as needed
      }
    } catch (error) {
      this.showError('Action failed: ' + error.message);
    }
  }

  handleSearch(input) {
    const searchType = input.dataset.search;
    const query = input.value.trim();
    
    // Debounce search
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      switch (searchType) {
        case 'products':
          this.loadProducts(query);
          break;
        // Add more search types as needed
      }
    }, 300);
  }

  handleFilePreview(input) {
    const file = input.files[0];
    if (!file) return;
    
    const previewId = input.dataset.preview;
    const preview = document.getElementById(previewId);
    
    if (preview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  }

  // ==================== UTILITY FUNCTIONS ====================
  formDataToObject(formData) {
    const obj = {};
    
    for (const [key, value] of formData.entries()) {
      if (key.endsWith('_file')) continue; // Skip file inputs
      
      // Handle checkboxes
      if (value === 'on') {
        obj[key] = true;
      } else if (key.endsWith('_checkbox')) {
        obj[key.replace('_checkbox', '')] = false;
      } else {
        obj[key] = value || null;
      }
    }
    
    // Parse JSON fields
    if (obj.ingredients) {
      try {
        obj.ingredients = JSON.parse(obj.ingredients);
      } catch {
        obj.ingredients = [];
      }
    }
    
    return obj;
  }

  showStatus(message, section = null) {
    const statusId = section ? `${section}Status` : 'globalStatus';
    const statusEl = document.getElementById(statusId);
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = 'status-message status-info';
    }
  }

  showSuccess(message, section = null) {
    const statusId = section ? `${section}Status` : 'globalStatus';
    const statusEl = document.getElementById(statusId);
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = 'status-message status-success';
      setTimeout(() => this.clearStatus(section), 3000);
    }
    
    // Also show toast notification
    this.showToast(message, 'success');
  }

  showError(message, section = null) {
    const statusId = section ? `${section}Status` : 'globalStatus';
    const statusEl = document.getElementById(statusId);
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = 'status-message status-error';
    }
    
    // Also show toast notification
    this.showToast(message, 'error');
    console.error('Admin Error:', message);
  }

  clearStatus(section = null) {
    const statusId = section ? `${section}Status` : 'globalStatus';
    const statusEl = document.getElementById(statusId);
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.className = 'status-message';
    }
  }

  // ==================== DATA IMPORT/EXPORT ====================
  async importSubcategoriesFromApp() {
    try {
      this.showStatus('Importing subcategories from app.js...', 'subcategories');
      
      // Define the subcategories that should exist based on app.js
      const requiredSubcategories = [
        // Single serve subcategories
        { slug: 'all', category_type: 'single', title_en: 'All Products', title_ar: 'جميع المنتجات', sort_order: 0 },
        { slug: 'fresh-veges', category_type: 'single', title_en: 'Fresh Vegetables', title_ar: 'خضار طازجة', sort_order: 1 },
        { slug: 'fresh-pickles', category_type: 'single', title_en: 'Fresh Pickles', title_ar: 'مخللات طازجة', sort_order: 2 },
        { slug: 'ordinary-pickles', category_type: 'single', title_en: 'Ordinary Pickles', title_ar: 'مخللات عادية', sort_order: 3 },
        { slug: 'olives', category_type: 'single', title_en: 'Olives', title_ar: 'زيتون', sort_order: 4 },
        { slug: 'olive-oil', category_type: 'single', title_en: 'Olive Oil', title_ar: 'زيت زيتون', sort_order: 5 },
        { slug: 'labne-kishik', category_type: 'single', title_en: 'Labne & Kishik', title_ar: 'لبنة وكشك', sort_order: 6 },
        { slug: 'pastes', category_type: 'single', title_en: 'Pastes', title_ar: 'معجون', sort_order: 7 },
        { slug: 'molases', category_type: 'single', title_en: 'Molasses', title_ar: 'دبس', sort_order: 8 },
        { slug: 'hydrosols', category_type: 'single', title_en: 'Hydrosols', title_ar: 'ماء الورد', sort_order: 9 },
        { slug: 'natural-syrubs', category_type: 'single', title_en: 'Natural Syrups', title_ar: 'شراب طبيعي', sort_order: 10 },
        { slug: 'tahhene', category_type: 'single', title_en: 'Tahini', title_ar: 'طحينة', sort_order: 11 },
        { slug: 'vinegar', category_type: 'single', title_en: 'Vinegar', title_ar: 'خل', sort_order: 12 },
        { slug: 'herbal', category_type: 'single', title_en: 'Herbal', title_ar: 'أعشاب', sort_order: 13 },
        { slug: 'kamar-el-din', category_type: 'single', title_en: 'Kamar El Din', title_ar: 'قمر الدين', sort_order: 14 },
        { slug: 'ready-to-serve', category_type: 'single', title_en: 'Ready to Serve', title_ar: 'جاهز للتقديم', sort_order: 15 },
        
        // Bulk subcategories  
        { slug: 'all-bulk', category_type: 'bulk', title_en: 'All Products', title_ar: 'جميع المنتجات', sort_order: 0 },
        { slug: 'fresh-veges-bulk', category_type: 'bulk', title_en: 'Fresh Vegetables', title_ar: 'خضار طازجة', sort_order: 1 },
        { slug: 'fresh-pickles-bulk', category_type: 'bulk', title_en: 'Fresh Pickles', title_ar: 'مخللات طازجة', sort_order: 2 },
        { slug: 'ordinary-pickles-bulk', category_type: 'bulk', title_en: 'Ordinary Pickles', title_ar: 'مخللات عادية', sort_order: 3 },
        { slug: 'olives-bulk', category_type: 'bulk', title_en: 'Olives', title_ar: 'زيتون', sort_order: 4 },
        { slug: 'olive-oil-bulk', category_type: 'bulk', title_en: 'Olive Oil', title_ar: 'زيت زيتون', sort_order: 5 },
        { slug: 'sunflower-oil', category_type: 'bulk', title_en: 'Sunflower Oil', title_ar: 'زيت دوار الشمس', sort_order: 6 },
        { slug: 'kishik-bulk', category_type: 'bulk', title_en: 'Kishik', title_ar: 'كشك', sort_order: 7 },
        { slug: 'pastes-bulk', category_type: 'bulk', title_en: 'Pastes', title_ar: 'معجون', sort_order: 8 },
        { slug: 'molases-bulk', category_type: 'bulk', title_en: 'Molasses', title_ar: 'دبس', sort_order: 9 },
        { slug: 'hydrosols-bulk', category_type: 'bulk', title_en: 'Hydrosols', title_ar: 'ماء الورد', sort_order: 10 },
        { slug: 'tahhene-bulk', category_type: 'bulk', title_en: 'Tahini', title_ar: 'طحينة', sort_order: 11 },
        { slug: 'vinegar-bulk', category_type: 'bulk', title_en: 'Vinegar', title_ar: 'خل', sort_order: 12 },
        { slug: 'herbal-bulk', category_type: 'bulk', title_en: 'Herbal', title_ar: 'أعشاب', sort_order: 13 },
        { slug: 'kamar-el-din-bulk', category_type: 'bulk', title_en: 'Kamar El Din', title_ar: 'قمر الدين', sort_order: 14 }
      ];

      let imported = 0;
      let updated = 0;

      for (const subcat of requiredSubcategories) {
        const { data: existing } = await this.supabase
          .from('subcategories')
          .select('slug')
          .eq('slug', subcat.slug)
          .single();

        if (existing) {
          // Update existing
          const { error } = await this.supabase
            .from('subcategories')
            .update({ ...subcat, active: true })
            .eq('slug', subcat.slug);
          
          if (!error) updated++;
        } else {
          // Insert new
          const { error } = await this.supabase
            .from('subcategories')
            .insert({ ...subcat, active: true });
          
          if (!error) imported++;
        }
      }

      this.showSuccess(`Import complete! ${imported} new, ${updated} updated subcategories.`, 'subcategories');
      await this.loadSubcategories();
      await this.loadSubcategoriesForDropdown();
      
    } catch (error) {
      this.showError('Import failed: ' + error.message, 'subcategories');
    }
  }

  async exportData(type) {
    try {
      let data, filename;
      
      switch (type) {
        case 'products':
          const { data: products } = await this.supabase.from('products').select('*');
          data = products;
          filename = 'karam-libnan-products.json';
          break;
          
        case 'subcategories':
          const { data: subcategories } = await this.supabase.from('subcategories').select('*');
          data = subcategories;
          filename = 'karam-libnan-subcategories.json';
          break;
          
        default:
          throw new Error('Invalid export type');
      }
      
      // Download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      this.showSuccess(`${type} exported successfully!`);
      
    } catch (error) {
      this.showError('Export failed: ' + error.message);
    }
  }

  // ==================== DATABASE SETUP ====================
  async checkDatabaseTables() {
    try {
      // Test basic table access
      const tests = [
        { table: 'products', test: () => this.supabase.from('products').select('id').limit(1) },
        { table: 'subcategories', test: () => this.supabase.from('subcategories').select('slug').limit(1) },
        { table: 'sections', test: () => this.supabase.from('sections').select('key').limit(1) }
      ];

      const results = {};
      
      for (const { table, test } of tests) {
        try {
          await test();
          results[table] = 'OK';
        } catch (error) {
          results[table] = error.message;
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('Database check failed:', error);
      return { error: error.message };
    }
  }

  async initializeDefaultSections() {
    try {
      const defaultSections = [
        {
          key: 'hero',
          title_en: 'Welcome to Karam Libnan',
          title_ar: 'مرحباً بكم في كرم لبنان',
          content_en: 'Authentic Homemade & Canned Lebanese Products. Crafted with passion, tradition, and the richness of Lebanon\'s natural bounty.',
          content_ar: 'منتجات لبنانية أصيلة محضرة في المنزل ومعلبة. مصنوعة بشغف وتقليد وثراء الطبيعة اللبنانية.'
        },
        {
          key: 'about',
          title_en: 'Our Story',
          title_ar: 'قصتنا',
          content_en: 'Karam Libnan was born from a love for authentic Lebanese flavors passed down through generations.',
          content_ar: 'ولدت كرم لبنان من حب النكهات اللبنانية الأصيلة المتوارثة عبر الأجيال.'
        }
      ];

      for (const section of defaultSections) {
        const { data: existing } = await this.supabase
          .from('sections')
          .select('key')
          .eq('key', section.key)
          .single();

        if (!existing) {
          await this.supabase.from('sections').insert(section);
        }
      }
      
    } catch (error) {
      console.error('Failed to initialize default sections:', error);
    }
  }

  // ==================== COLOR MANAGEMENT ====================
  async loadColorSettings() {
    try {
      this.showStatus('Loading color settings...', 'colors');
      
      // Setup color input synchronization
      this.setupColorInputSync();
      
      // Load saved color settings from database or localStorage
      await this.loadSavedColors();
      
      this.clearStatus('colors');
      
    } catch (error) {
      this.showError('Failed to load color settings: ' + error.message, 'colors');
    }
  }

  setupColorInputSync() {
    // Sync color picker with text input for each color setting
    const colorCategories = [
      'sectionTitles', 'sectionIntros', 'paragraphs', 'aboutText',
      'productDesc', 'ingredients', 'filterButtons', 
      'contactLabels', 'contactInputs', 'contactInfo'
    ];

    colorCategories.forEach(category => {
      const colorInput = document.getElementById(`${category}Color`);
      const textInput = document.getElementById(`${category}ColorText`);
      
      if (colorInput && textInput) {
        // Sync color picker to text input
        colorInput.addEventListener('input', (e) => {
          textInput.value = e.target.value;
          this.previewColorChange(category, e.target.value);
        });
        
        // Sync text input to color picker
        textInput.addEventListener('input', (e) => {
          if (this.isValidColor(e.target.value)) {
            colorInput.value = e.target.value;
            this.previewColorChange(category, e.target.value);
          }
        });
      }
    });
  }

  async loadSavedColors() {
    try {
      // Try to load from localStorage for now (can be extended to database)
      const saved = localStorage.getItem('karamLibnan_colorSettings');
      const colorSettings = saved ? JSON.parse(saved) : this.getDefaultColors();
      
      this.applyColorSettingsToForm(colorSettings);
      
    } catch (error) {
      console.log('No saved colors found, using defaults');
      this.applyColorSettingsToForm(this.getDefaultColors());
    }
  }

  getDefaultColors() {
    return {
      sectionTitles: '#001f3f',
      sectionIntros: '#001f3f', 
      paragraphs: '#001f3f',
      aboutText: '#001f3f',
      productDesc: '#001f3f',
      ingredients: '#001f3f',
      filterButtons: '#001f3f',
      contactLabels: '#001f3f',
      contactInputs: '#001f3f',
      contactInfo: '#001f3f'
    };
  }

  applyColorSettingsToForm(settings) {
    Object.keys(settings).forEach(category => {
      const colorInput = document.getElementById(`${category}Color`);
      const textInput = document.getElementById(`${category}ColorText`);
      
      if (colorInput && textInput) {
        colorInput.value = settings[category];
        textInput.value = settings[category];
      }
    });
  }

  previewColorChange(category, color) {
    // Apply color change immediately for preview
    this.applyColorToWebsite(category, color);
  }

  applyColorToWebsite(category, color) {
    // Create or update dynamic CSS
    let styleSheet = document.getElementById('dynamicColorStyles');
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = 'dynamicColorStyles';
      document.head.appendChild(styleSheet);
    }

    // Map categories to CSS selectors
    const selectorMap = {
      sectionTitles: '.section-title',
      sectionIntros: '.section-intro',
      paragraphs: 'p, .desc',
      aboutText: '#about p, #about .values-list li',
      productDesc: '.card-body, .card-body .desc',
      ingredients: '.ingredients, .card .ingredients',
      filterButtons: '.filter-btn, .main-cat-tab',
      contactLabels: '#contact label, #contact .form-status',
      contactInputs: '#contact input, #contact textarea',
      contactInfo: '#contact .contact-info p'
    };

    const selector = selectorMap[category];
    if (selector) {
      // Update the CSS rule
      let existingRules = styleSheet.innerHTML;
      const rulePattern = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*{[^}]*}`, 'g');
      
      // Remove existing rule for this selector
      existingRules = existingRules.replace(rulePattern, '');
      
      // Add new rule
      const newRule = `${selector} { color: ${color} !important; }`;
      styleSheet.innerHTML = existingRules + '\n' + newRule;
    }
  }

  async applyColorChanges() {
    try {
      this.showStatus('Applying color changes...', 'colors');
      
      // Collect all color settings
      const colorSettings = {};
      const colorCategories = [
        'sectionTitles', 'sectionIntros', 'paragraphs', 'aboutText',
        'productDesc', 'ingredients', 'filterButtons', 
        'contactLabels', 'contactInputs', 'contactInfo'
      ];

      colorCategories.forEach(category => {
        const textInput = document.getElementById(`${category}ColorText`);
        if (textInput && this.isValidColor(textInput.value)) {
          colorSettings[category] = textInput.value;
        }
      });

      // Save to localStorage
      localStorage.setItem('karamLibnan_colorSettings', JSON.stringify(colorSettings));

      // Generate and download CSS file
      await this.generateColorCSS(colorSettings);

      this.showSuccess('Color settings saved! Download the CSS file and upload it to your server.', 'colors');
      
    } catch (error) {
      this.showError('Failed to save color settings: ' + error.message, 'colors');
    }
  }

  async generateColorCSS(colorSettings) {
    // Generate CSS content with new colors
    const cssContent = `/* Dynamic Color Settings - Generated by Admin Panel */
:root {
  --dynamic-section-titles: ${colorSettings.sectionTitles || '#001f3f'};
  --dynamic-section-intros: ${colorSettings.sectionIntros || '#001f3f'};
  --dynamic-paragraphs: ${colorSettings.paragraphs || '#001f3f'};
  --dynamic-about-text: ${colorSettings.aboutText || '#001f3f'};
  --dynamic-product-desc: ${colorSettings.productDesc || '#001f3f'};
  --dynamic-ingredients: ${colorSettings.ingredients || '#001f3f'};
  --dynamic-filter-buttons: ${colorSettings.filterButtons || '#001f3f'};
  --dynamic-contact-labels: ${colorSettings.contactLabels || '#001f3f'};
  --dynamic-contact-inputs: ${colorSettings.contactInputs || '#001f3f'};
  --dynamic-contact-info: ${colorSettings.contactInfo || '#001f3f'};
}

/* Apply dynamic colors */
.section-title { color: var(--dynamic-section-titles) !important; }
.section-intro { color: var(--dynamic-section-intros) !important; }

/* Body text */
p, .desc { color: var(--dynamic-paragraphs) !important; }

/* About section */
#about p,
#about .values-list li { color: var(--dynamic-about-text) !important; }

/* Product text */
.card-body,
.card-body .desc { color: var(--dynamic-product-desc) !important; }

.ingredients,
.card .ingredients { color: var(--dynamic-ingredients) !important; }

/* Filter buttons */
.filter-btn,
.main-cat-tab { color: var(--dynamic-filter-buttons) !important; }

/* Contact section */
#contact label,
#contact .form-status { color: var(--dynamic-contact-labels) !important; }

#contact input,
#contact textarea { color: var(--dynamic-contact-inputs) !important; }

#contact .contact-info p { color: var(--dynamic-contact-info) !important; }
`;

    // Create a blob and download it
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    
    // Download the CSS file
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dynamic-colors.css';
    a.click();
    URL.revokeObjectURL(url);
    
    // Also inject it into the current page immediately for preview
    let dynamicSheet = document.getElementById('dynamicColorSheet');
    if (!dynamicSheet) {
      dynamicSheet = document.createElement('style');
      dynamicSheet.id = 'dynamicColorSheet';
      document.head.appendChild(dynamicSheet);
    }
    dynamicSheet.innerHTML = cssContent;
  }

  applyColorPreset(presetName) {
    const presets = {
      navy: {
        sectionTitles: '#001f3f', sectionIntros: '#001f3f', paragraphs: '#001f3f',
        aboutText: '#001f3f', productDesc: '#001f3f', ingredients: '#001f3f',
        filterButtons: '#001f3f', contactLabels: '#001f3f', contactInputs: '#001f3f', contactInfo: '#001f3f'
      },
      black: {
        sectionTitles: '#000000', sectionIntros: '#000000', paragraphs: '#000000',
        aboutText: '#000000', productDesc: '#000000', ingredients: '#000000',
        filterButtons: '#000000', contactLabels: '#000000', contactInputs: '#000000', contactInfo: '#000000'
      },
      darkgray: {
        sectionTitles: '#374151', sectionIntros: '#374151', paragraphs: '#374151',
        aboutText: '#374151', productDesc: '#374151', ingredients: '#374151',
        filterButtons: '#374151', contactLabels: '#374151', contactInputs: '#374151', contactInfo: '#374151'
      },
      olive: {
        sectionTitles: '#5e6b3d', sectionIntros: '#5e6b3d', paragraphs: '#5e6b3d',
        aboutText: '#5e6b3d', productDesc: '#5e6b3d', ingredients: '#5e6b3d',
        filterButtons: '#5e6b3d', contactLabels: '#5e6b3d', contactInputs: '#5e6b3d', contactInfo: '#5e6b3d'
      },
      brown: {
        sectionTitles: '#8b4513', sectionIntros: '#8b4513', paragraphs: '#8b4513',
        aboutText: '#8b4513', productDesc: '#8b4513', ingredients: '#8b4513',
        filterButtons: '#8b4513', contactLabels: '#8b4513', contactInputs: '#8b4513', contactInfo: '#8b4513'
      }
    };

    const preset = presets[presetName];
    if (preset) {
      this.applyColorSettingsToForm(preset);
      
      // Apply preview immediately
      Object.keys(preset).forEach(category => {
        this.previewColorChange(category, preset[category]);
      });
      
      this.showSuccess(`Applied ${presetName} color preset!`, 'colors');
    }
  }

  resetColorsToDefault() {
    if (confirm('Reset all colors to default navy theme?')) {
      const defaultColors = this.getDefaultColors();
      this.applyColorSettingsToForm(defaultColors);
      
      // Apply preview immediately
      Object.keys(defaultColors).forEach(category => {
        this.previewColorChange(category, defaultColors[category]);
      });
      
      this.showSuccess('Colors reset to default!', 'colors');
    }
  }

  isValidColor(color) {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  }

  // ==================== MEDIA MANAGEMENT ====================
  async loadMedia() {
    try {
      this.showStatus('Loading media files...', 'media');
      
      const { data, error } = await this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .list('', {
          limit: 100,
          offset: 0
        });
      
      if (error) throw error;
      
      this.renderMediaLibrary(data);
      this.clearStatus('media');
      
    } catch (error) {
      this.showError('Failed to load media: ' + error.message, 'media');
    }
  }

  renderMediaLibrary(files) {
    const container = document.getElementById('mediaLibrary');
    if (!container) return;

    if (!files || files.length === 0) {
      container.innerHTML = '<p>No media files found.</p>';
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
        ${files.map(file => {
          const publicUrl = this.supabase.storage
            .from(this.STORAGE_BUCKET)
            .getPublicUrl(file.name).data.publicUrl;
          
          return `
            <div class="media-item" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.5rem;">
              <img src="${publicUrl}" alt="${file.name}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;">
              <div style="font-size: 0.75rem; color: #6b7280; word-break: break-all;">${file.name}</div>
              <div style="font-size: 0.625rem; color: #9ca3af;">${this.formatFileSize(file.metadata?.size || 0)}</div>
              <button class="btn btn-sm btn-danger" style="margin-top: 0.5rem; width: 100%; font-size: 0.625rem;" onclick="adminManager.deleteMediaFile('${file.name}')">
                Delete
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async deleteMediaFile(fileName) {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;
    
    try {
      const { error } = await this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .remove([fileName]);
      
      if (error) throw error;
      
      this.showSuccess('File deleted successfully!', 'media');
      await this.loadMedia();
      
    } catch (error) {
      this.showError('Failed to delete file: ' + error.message, 'media');
    }
  }

  showUploadDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      
      try {
        this.showStatus('Uploading files...', 'media');
        
        for (const file of files) {
          await this.uploadImage(file, 'uploads');
        }
        
        this.showSuccess(`${files.length} file(s) uploaded successfully!`, 'media');
        await this.loadMedia();
        
      } catch (error) {
        this.showError('Upload failed: ' + error.message, 'media');
      }
    };
    
    input.click();
  }

  refreshMediaLibrary() {
    this.loadMedia();
  }

  // ==================== NOTIFICATION SYSTEM ====================
  showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      `;
      document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${type === 'error' ? '#dc2626' : type === 'success' ? '#059669' : '#3b82f6'};
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-size: 0.875rem;
      font-weight: 500;
      max-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    toast.textContent = message;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Remove after duration
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  // ==================== HELPER FUNCTIONS FOR FORMS ====================
  async loadSubcategoryForEdit(slug) {
    try {
      const { data, error } = await this.supabase
        .from('subcategories')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      
      this.editingItem = slug;
      this.populateSubcategoryForm(data);
      this.showSubcategoryForm(true);
      
    } catch (error) {
      this.showError('Failed to load subcategory: ' + error.message, 'subcategories');
    }
  }

  populateSubcategoryForm(subcategory) {
    const form = document.getElementById('subcategoryForm');
    if (!form) return;
    
    Object.keys(subcategory).forEach(key => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = !!subcategory[key];
        } else {
          field.value = subcategory[key] || '';
        }
      }
    });
    
    if (subcategory.banner_image_url) {
      const preview = document.getElementById('subcategoryBannerPreview');
      if (preview) {
        preview.src = subcategory.banner_image_url;
        preview.style.display = 'block';
      }
    }
  }

  showSubcategoryForm(isEdit = false) {
    const form = document.getElementById('subcategoryFormPanel');
    const title = document.getElementById('subcategoryFormTitle');
    
    if (form) {
      form.classList.remove('hidden');
      if (title) {
        title.textContent = isEdit ? 'Edit Subcategory' : 'New Subcategory';
      }
    }
  }

  async loadSectionForEdit(key) {
    try {
      const { data, error } = await this.supabase
        .from('sections')
        .select('*')
        .eq('key', key)
        .single();
      
      if (error) throw error;
      
      this.editingItem = key;
      this.populateSectionForm(data);
      this.showSectionForm(true);
      
    } catch (error) {
      this.showError('Failed to load section: ' + error.message, 'sections');
    }
  }

  populateSectionForm(section) {
    const form = document.getElementById('sectionForm');
    if (!form) return;
    
    Object.keys(section).forEach(key => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) {
        field.value = section[key] || '';
      }
    });
    
    if (section.image_url) {
      const preview = document.getElementById('sectionImagePreview');
      if (preview) {
        preview.src = section.image_url;
        preview.style.display = 'block';
      }
    }
  }

  showSectionForm(isEdit = false) {
    const form = document.getElementById('sectionFormPanel');
    const title = document.getElementById('sectionFormTitle');
    
    if (form) {
      form.classList.remove('hidden');
      if (title) {
        title.textContent = isEdit ? 'Edit Section' : 'New Section';
      }
    }
  }

  hideSubcategoryForm() {
    const form = document.getElementById('subcategoryFormPanel');
    if (form) {
      form.classList.add('hidden');
      const subcategoryForm = document.getElementById('subcategoryForm');
      if (subcategoryForm) {
        subcategoryForm.reset();
      }
      this.editingItem = null;
    }
  }

  hideSectionForm() {
    const form = document.getElementById('sectionFormPanel');
    if (form) {
      form.classList.add('hidden');
      const sectionForm = document.getElementById('sectionForm');
      if (sectionForm) {
        sectionForm.reset();
      }
      this.editingItem = null;
    }
  }
  
  async initializeCoreSections() {
    try {
      this.showStatus('Initializing core sections...', 'sections');
      
      // First, let's check what columns exist in the sections table
      console.log('Checking sections table structure...');
      
      // Try to get existing sections to see table structure
      const { data: existingSections, error: checkError } = await this.supabase
        .from('sections')
        .select('*')
        .limit(1);
        
      if (checkError) {
        console.warn('Error checking sections table:', checkError);
      } else {
        console.log('Existing sections structure:', existingSections);
      }
      
      const coreSections = [
        {
          key: 'hero',
          title_en: 'Authentic Homemade & Canned Lebanese Products'
        },
        {
          key: 'about', 
          title_en: 'Our Story'
        }
      ];
      
      let addedCount = 0;
      
      for (const section of coreSections) {
        // Check if section already exists
        const { data: existing } = await this.supabase
          .from('sections')
          .select('key')
          .eq('key', section.key)
          .single();
          
        if (!existing) {
          console.log(`Adding section: ${section.key}`);
          const { error } = await this.supabase
            .from('sections')
            .insert(section);
            
          if (error) {
            console.warn(`Failed to add section ${section.key}:`, error);
          } else {
            addedCount++;
            console.log(`Successfully added section: ${section.key}`);
          }
        } else {
          console.log(`Section ${section.key} already exists`);
        }
      }
      
      if (addedCount > 0) {
        this.showSuccess(`Added ${addedCount} core sections to database!`, 'sections');
        await this.loadSections();
      } else {
        this.showSuccess('All core sections already exist in database', 'sections');
      }
      
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError('Failed to initialize core sections: ' + error.message, 'sections');
    }
  }
  
  async cleanupSections() {
    if (!confirm('This will remove duplicate and orphaned sections. Continue?')) {
      return;
    }
    
    try {
      this.showStatus('Cleaning up sections...', 'sections');
      
      // Remove any sections that don't have proper keys or are duplicates
      const validKeys = ['hero', 'about', 'contact', 'products'];
      
      // Get all sections
      const { data: allSections, error: fetchError } = await this.supabase
        .from('sections')
        .select('key, title_en');
        
      if (fetchError) throw fetchError;
      
      let removedCount = 0;
      
      for (const section of allSections) {
        // Remove sections with invalid keys or duplicates of hero content
        const shouldRemove = 
          !section.key || 
          section.key.trim() === '' ||
          (section.title_en && section.title_en.includes('Authentic Homemade') && section.key !== 'hero');
          
        if (shouldRemove) {
          const { error } = await this.supabase
            .from('sections')
            .delete()
            .eq('key', section.key);
            
          if (error) {
            console.warn(`Failed to remove section ${section.key}:`, error);
          } else {
            removedCount++;
            console.log(`Removed duplicate/orphaned section: ${section.key}`);
            
            // Also remove from DOM if it exists
            const element = document.getElementById(section.key);
            if (element && element.id !== 'home') { // Don't remove the actual hero section
              element.remove();
            }
          }
        }
      }
      
      this.showSuccess(`Cleaned up ${removedCount} sections!`, 'sections');
      await this.loadSections();
      
    } catch (error) {
      console.error('Cleanup error:', error);
      this.showError('Failed to cleanup sections: ' + error.message, 'sections');
    }
  }
}

// Initialize admin when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.adminManager = new AdminManager();
});
