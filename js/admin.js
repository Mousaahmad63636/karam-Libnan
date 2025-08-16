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
        media: 'Media Management'
      };
      topbarTitle.textContent = titles[sectionName] || 'Admin Panel';
    }
    
    // Show section by removing hidden class
    const section = document.getElementById(`section-${sectionName}`);
    console.log('Found section element:', section);
    if (section) {
      section.classList.remove('hidden');
      this.loadSectionData(sectionName);
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
    switch (section) {
      case 'dashboard':
        await this.loadDashboardStats();
        break;
      case 'products':
        await this.loadProducts();
        await this.loadSubcategoriesForDropdown();
        break;
      case 'subcategories':
        await this.loadSubcategories();
        break;
      case 'sections':
        await this.loadSections();
        break;
      case 'media':
        await this.loadMedia();
        break;
    }
  }

  async loadDashboardStats() {
    try {
      const [products, subcategories, sections] = await Promise.all([
        this.supabase.from('products').select('id, active, featured'),
        this.supabase.from('subcategories').select('slug, active'),
        this.supabase.from('sections').select('key')
      ]);

      const stats = {
        totalProducts: products.data?.length || 0,
        activeProducts: products.data?.filter(p => p.active).length || 0,
        featuredProducts: products.data?.filter(p => p.featured).length || 0,
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
      
      this.renderProductsTable(data);
      this.clearStatus('products');
      
    } catch (error) {
      this.showError('Failed to load products: ' + error.message, 'products');
    }
  }

  renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

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
      
      // Handle image upload
      const imageFile = formData.get('image_file');
      if (imageFile && imageFile.size > 0) {
        product.image_url = await this.uploadImage(imageFile, 'products');
      }
      
      if (this.editingItem) {
        const { error } = await this.supabase
          .from('products')
          .update(product)
          .eq('id', this.editingItem);
        
        if (error) throw error;
        this.showSuccess('Product updated successfully!', 'products');
      } else {
        const { error } = await this.supabase
          .from('products')
          .insert(product);
        
        if (error) throw error;
        this.showSuccess('Product created successfully!', 'products');
      }
      
      this.hideProductForm();
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
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      this.editingItem = id;
      this.populateProductForm(data);
      this.showProductForm(true);
      
    } catch (error) {
      this.showError('Failed to load product: ' + error.message, 'products');
    }
  }

  populateProductForm(product) {
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
    
    // Show image preview
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
      this.showStatus('Loading subcategories...', 'subcategories');
      
      const { data, error } = await this.supabase
        .from('subcategories')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      
      this.renderSubcategoriesTable(data);
      this.clearStatus('subcategories');
      
    } catch (error) {
      this.showError('Failed to load subcategories: ' + error.message, 'subcategories');
    }
  }

  renderSubcategoriesTable(subcategories) {
    const tbody = document.getElementById('subcategoriesTableBody');
    if (!tbody) return;

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

        case 'cancel-section':
          this.hideSectionForm();
          break;

        case 'import-subcategories':
          await this.importSubcategoriesFromApp();
          break;

        case 'check-system':
          await this.checkSystemStatus();
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
}

// Initialize admin when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.adminManager = new AdminManager();
});
