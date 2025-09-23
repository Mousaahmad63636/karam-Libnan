/* =============================
   Karam Libnan - Streamlined Admin Panel
   Fixed version that actually works with Supabase
   ============================= */

import { supabase, testConnection } from './supabaseClient.js'

class AdminManager {
  constructor() {
    this.currentSection = 'dashboard'
    this.editingItem = null
    
    this.init()
  }

  async init() {
    console.log('Initializing Admin Panel...')
    
    // Test Supabase connection
    const test = await testConnection()
    if (!test.success) {
      this.showError(`Database connection failed: ${test.error}`)
      return
    }
    
    // Setup event listeners
    this.setupEventListeners()
    
    // Show dashboard by default
    this.showSection('dashboard')
    
    console.log('Admin Panel initialized successfully')
  }

  setupEventListeners() {
    // Navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-section]')) {        e.preventDefault()
        const section = e.target.dataset.section
        this.showSection(section)
      }
      
      // Refresh buttons
      if (e.target.matches('[data-refresh]')) {
        e.preventDefault()
        const section = e.target.dataset.refresh
        this.loadSectionData(section)
      }
      
      // Edit buttons
      if (e.target.matches('[data-edit]')) {
        e.preventDefault()
        const table = e.target.dataset.edit
        const id = e.target.dataset.id
        this.editItem(table, id)
      }
      
      // Delete buttons
      if (e.target.matches('[data-delete]')) {
        e.preventDefault()
        const table = e.target.dataset.delete
        const id = e.target.dataset.id
        this.deleteItem(table, id)
      }
      
      // Save buttons
      if (e.target.matches('[data-save]')) {
        e.preventDefault()
        const table = e.target.dataset.save
        this.saveItem(table)
      }
    })
  }

  // ==================== NAVIGATION ====================
  showSection(sectionId) {
    console.log(`Showing section: ${sectionId}`)
    
    // Hide all sections
    document.querySelectorAll('main section').forEach(section => {
      section.classList.add('hidden')
    })
    
    // Show target section
    const section = document.getElementById(`section-${sectionId}`)
    if (section) {
      section.classList.remove('hidden')
      this.currentSection = sectionId
      
      // Update active nav
      document.querySelectorAll('.sidebar nav a').forEach(link => {
        link.classList.remove('active')
      })
      document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active')
      
      // Load section data
      this.loadSectionData(sectionId)
    } else {
      console.error(`Section not found: section-${sectionId}`)
    }
  }

  async loadSectionData(sectionId) {
    try {
      switch (sectionId) {
        case 'dashboard':
          await this.loadDashboard()
          break
        case 'products':
          await this.loadProducts()
          break
        case 'subcategories':
          await this.loadSubcategories()
          break
        case 'main-categories':
          await this.loadMainCategories()
          break
        case 'sections':
          await this.loadSections()
          break
        default:
          console.log(`No data loader for section: ${sectionId}`)
      }
    } catch (error) {
      console.error(`Error loading ${sectionId}:`, error)
      this.showError(`Failed to load ${sectionId}: ${error.message}`)
    }
  }

  // ==================== DASHBOARD ====================
  async loadDashboard() {
    try {
      // Load dashboard statistics
      const [productsResult, subcatsResult, mainCatsResult, sectionsResult] = await Promise.all([
        supabase.from('products').select('count'),
        supabase.from('subcategories').select('count'),
        supabase.from('main_categories').select('count'),
        supabase.from('sections').select('count')
      ])

      // Update dashboard counts
      document.getElementById('products-count').textContent = 
        productsResult.count || productsResult.data?.length || '0'
      document.getElementById('subcategories-count').textContent = 
        subcatsResult.count || subcatsResult.data?.length || '0'
      document.getElementById('main-categories-count').textContent = 
        mainCatsResult.count || mainCatsResult.data?.length || '0'
      document.getElementById('sections-count').textContent = 
        sectionsResult.count || sectionsResult.data?.length || '0'

      this.showSuccess('Dashboard loaded successfully')
    } catch (error) {
      console.error('Dashboard load error:', error)
      this.showError('Failed to load dashboard stats')
    }
  }

  // ==================== PRODUCTS ====================
  
  async loadProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name_en, name_ar, description_en, main_type, sub_slug, 
          featured, active, image_url, created_at
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const tbody = document.querySelector('#products-table tbody')
      if (!tbody) return

      tbody.innerHTML = data.map(product => `
        <tr>
          <td>${product.id}</td>
          <td>
            ${product.image_url ? `<img src="${product.image_url}" alt="Product" style="width:40px;height:40px;object-fit:cover;border-radius:4px;">` : ''}
          </td>
          <td><strong>${product.name_en || ''}</strong><br><small>${product.name_ar || ''}</small></td>
          <td>${product.description_en || ''}</td>
          <td><span class="badge badge-${product.main_type}">${product.main_type}</span></td>
          <td>${product.sub_slug || ''}</td>
          <td><span class="badge ${product.featured ? 'badge-success' : 'badge-secondary'}">${product.featured ? 'Yes' : 'No'}</span></td>
          <td><span class="badge ${product.active ? 'badge-success' : 'badge-danger'}">${product.active ? 'Active' : 'Inactive'}</span></td>
          <td>
            <button data-edit="products" data-id="${product.id}" class="btn btn-sm btn-primary">Edit</button>
            <button data-delete="products" data-id="${product.id}" class="btn btn-sm btn-danger">Delete</button>
          </td>
        </tr>
      `).join('')

      this.showSuccess(`Loaded ${data.length} products`)
    } catch (error) {
      console.error('Products load error:', error)
      this.showError(`Failed to load products: ${error.message}`)
    }
  }
  // ==================== SUBCATEGORIES ====================
  
  async loadSubcategories() {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('slug, title_en, title_ar, category_type, sort_order, active, created_at')
        .order('sort_order', { ascending: true })

      if (error) throw error

      const tbody = document.querySelector('#subcategories-table tbody')
      if (!tbody) return

      tbody.innerHTML = data.map(subcat => `
        <tr>
          <td>${subcat.slug}</td>
          <td><strong>${subcat.title_en || ''}</strong><br><small>${subcat.title_ar || ''}</small></td>
          <td><span class="badge badge-${subcat.category_type}">${subcat.category_type}</span></td>
          <td>${subcat.sort_order}</td>
          <td><span class="badge ${subcat.active ? 'badge-success' : 'badge-danger'}">${subcat.active ? 'Active' : 'Inactive'}</span></td>
          <td>
            <button data-edit="subcategories" data-id="${subcat.slug}" class="btn btn-sm btn-primary">Edit</button>
            <button data-delete="subcategories" data-id="${subcat.slug}" class="btn btn-sm btn-danger">Delete</button>
          </td>
        </tr>
      `).join('')

      this.showSuccess(`Loaded ${data.length} subcategories`)
    } catch (error) {
      console.error('Subcategories load error:', error)
      this.showError(`Failed to load subcategories: ${error.message}`)
    }
  }

  // ==================== MAIN CATEGORIES ====================
  
  async loadMainCategories() {
    try {
      const { data, error } = await supabase
        .from('main_categories')
        .select('slug, title_en, title_ar, sort_order, active, created_at')
        .order('sort_order', { ascending: true })

      if (error) throw error

      const tbody = document.querySelector('#main-categories-table tbody')
      if (!tbody) return

      tbody.innerHTML = data.map(maincat => `
        <tr>
          <td>${maincat.slug}</td>
          <td><strong>${maincat.title_en || ''}</strong><br><small>${maincat.title_ar || ''}</small></td>
          <td>${maincat.sort_order}</td>
          <td><span class="badge ${maincat.active ? 'badge-success' : 'badge-danger'}">${maincat.active ? 'Active' : 'Inactive'}</span></td>
          <td>
            <button data-edit="main_categories" data-id="${maincat.slug}" class="btn btn-sm btn-primary">Edit</button>
            <button data-delete="main_categories" data-id="${maincat.slug}" class="btn btn-sm btn-danger">Delete</button>
          </td>
        </tr>
      `).join('')

      this.showSuccess(`Loaded ${data.length} main categories`)
    } catch (error) {
      console.error('Main categories load error:', error)
      this.showError(`Failed to load main categories: ${error.message}`)
    }
  }
  // ==================== SECTIONS ====================
  
  async loadSections() {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('key, title_en, title_ar, content_en, sort_order, image_url, created_at')
        .order('sort_order', { ascending: true })

      if (error) throw error

      const tbody = document.querySelector('#sections-table tbody')
      if (!tbody) return

      tbody.innerHTML = data.map(section => `
        <tr>
          <td>${section.key}</td>
          <td>
            ${section.image_url ? `<img src="${section.image_url}" alt="Section" style="width:40px;height:40px;object-fit:cover;border-radius:4px;">` : ''}
          </td>
          <td><strong>${section.title_en || ''}</strong><br><small>${section.title_ar || ''}</small></td>
          <td>${(section.content_en || '').substring(0, 100)}${section.content_en?.length > 100 ? '...' : ''}</td>
          <td>${section.sort_order || 0}</td>
          <td>
            <button data-edit="sections" data-id="${section.key}" class="btn btn-sm btn-primary">Edit</button>
            <button data-delete="sections" data-id="${section.key}" class="btn btn-sm btn-danger">Delete</button>
          </td>
        </tr>
      `).join('')

      this.showSuccess(`Loaded ${data.length} sections`)
    } catch (error) {
      console.error('Sections load error:', error)
      this.showError(`Failed to load sections: ${error.message}`)
    }
  }

  // ==================== CRUD OPERATIONS ====================
  
  async editItem(table, id) {
    console.log(`Editing ${table} item:`, id)
    
    if (table === 'products') {
      await this.editProduct(id)
    } else {
      this.showInfo(`Edit ${table} functionality coming soon`)
    }
  }

  async editProduct(id) {
    try {
      // Fetch product data
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
        
      if (error) throw error
      
      // Store editing item
      this.editingItem = data
      
      // Fill form with data
      const form = document.getElementById('productForm')
      form.elements['name_en'].value = data.name_en || ''
      form.elements['name_ar'].value = data.name_ar || ''
      form.elements['description_en'].value = data.description_en || ''
      form.elements['description_ar'].value = data.description_ar || ''
      form.elements['main_type'].value = data.main_type || 'single'
      form.elements['sub_slug'].value = data.sub_slug || ''
      form.elements['ingredients'].value = JSON.stringify(data.ingredients || [])
      form.elements['ingredients_ar'].value = JSON.stringify(data.ingredients_ar || [])
      form.elements['variants'].value = JSON.stringify(data.variants || [])
      form.elements['variants_ar'].value = JSON.stringify(data.variants_ar || [])
      form.elements['tags'].value = JSON.stringify(data.tags || [])
      form.elements['tags_ar'].value = JSON.stringify(data.tags_ar || [])
      form.elements['featured'].checked = data.featured || false
      form.elements['active'].checked = data.active !== false
      
      // Show form panel
      document.getElementById('productFormPanel').classList.remove('hidden')
      document.getElementById('productFormTitle').textContent = 'Edit Product'
      
      this.showSuccess('Product loaded for editing')
      
    } catch (error) {
      console.error('Edit product error:', error)
      this.showError(`Failed to load product: ${error.message}`)
    }
  }

  async deleteItem(table, id) {
    if (!confirm(`Are you sure you want to delete this ${table} item?`)) return
    
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(table === 'products' ? 'id' : table === 'sections' ? 'key' : 'slug', id)

      if (error) throw error

      this.showSuccess(`${table} item deleted successfully`)
      this.loadSectionData(this.currentSection)
    } catch (error) {
      console.error(`Delete ${table} error:`, error)
      this.showError(`Failed to delete ${table}: ${error.message}`)
    }
  }

  async saveItem(table) {
    console.log(`Saving ${table} item`)
    
    if (table === 'products') {
      await this.saveProduct()
    } else {
      this.showInfo(`Save ${table} functionality coming soon`)
    }
  }

  async saveProduct() {
    try {
      const form = document.getElementById('productForm')
      const formData = new FormData(form)
      
      // Handle image upload first if file selected
      let imageUrl = null
      const imageFile = formData.get('image_file')
      if (imageFile && imageFile.size > 0) {
        imageUrl = await this.uploadImageToStorage(imageFile)
      }
      
      // Prepare product data
      const productData = {
        name_en: formData.get('name_en'),
        name_ar: formData.get('name_ar'),
        description_en: formData.get('description_en'), 
        description_ar: formData.get('description_ar'),
        main_type: formData.get('main_type'),
        sub_slug: formData.get('sub_slug') || null,
        ingredients: this.parseArrayField(formData.get('ingredients')),
        ingredients_ar: this.parseArrayField(formData.get('ingredients_ar')),
        variants: this.parseArrayField(formData.get('variants')),
        variants_ar: this.parseArrayField(formData.get('variants_ar')),
        tags: this.parseArrayField(formData.get('tags')),
        tags_ar: this.parseArrayField(formData.get('tags_ar')),
        featured: formData.has('featured'),
        active: formData.has('active')
      }
      
      // Add image URL if uploaded
      if (imageUrl) {
        productData.image_url = imageUrl
      }
      
      let result
      if (this.editingItem) {
        // Update existing product
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', this.editingItem.id)
          .select()
      } else {
        // Create new product
        result = await supabase
          .from('products')
          .insert([productData])
          .select()
      }
      
      if (result.error) throw result.error
      
      this.showSuccess(`Product ${this.editingItem ? 'updated' : 'created'} successfully`)
      
      // Reset form and reload data
      form.reset()
      document.getElementById('productFormPanel').classList.add('hidden')
      this.editingItem = null
      this.loadProducts()
      
    } catch (error) {
      console.error('Save product error:', error)
      this.showError(`Failed to save product: ${error.message}`)
    }
  }

  async uploadImageToStorage(file) {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `products/${fileName}`
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file)
        
      if (error) throw error
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)
        
      return urlData.publicUrl
      
    } catch (error) {
      console.error('Image upload error:', error)
      throw new Error(`Image upload failed: ${error.message}`)
    }
  }

  parseArrayField(arrayStr) {
    try {
      if (!arrayStr || arrayStr.trim() === '') return []
      return JSON.parse(arrayStr)
    } catch (error) {
      // If not valid JSON, split by comma
      return arrayStr.split(',').map(s => s.trim()).filter(s => s)
    }
  }
  // ==================== UTILITIES ====================
  
  showSuccess(message) {
    this.showNotification(message, 'success')
  }

  showError(message) {
    this.showNotification(message, 'error')
    console.error('Admin Error:', message)
  }

  showInfo(message) {
    this.showNotification(message, 'info')
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `alert alert-${type} notification`
    notification.textContent = message
    
    document.body.appendChild(notification)
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 5000)
    
    console.log(`[${type.toUpperCase()}] ${message}`)
  }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.adminManager = new AdminManager()
})

// Global access for debugging
window.AdminManager = AdminManager
