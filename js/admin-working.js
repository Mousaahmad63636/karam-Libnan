/* =============================
   Karam Libnan - Working Admin Panel JavaScript
   Clean implementation that actually works
   ============================= */

import { supabase } from './supabaseClient.js';

class KaramAdmin {
    constructor() {
        this.currentSection = 'dashboard';
        this.isLoading = false;
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Karam Libnan Admin...');
        
        // Test database connection
        const connected = await this.testConnection();
        if (!connected) {
            console.error('❌ Database connection failed');
            return;
        }

        // Setup event listeners
        this.setupEventListeners();
        
        // Load dashboard by default
        this.showSection('dashboard');
        this.loadDashboard();
        
        console.log('✅ Admin initialized successfully');
    }

    async testConnection() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id')
                .limit(1);
            
            if (error) {
                this.showError('Database connection failed: ' + error.message);
                return false;
            }
            
            console.log('✅ Database connected');
            return true;
        } catch (err) {
            this.showError('Connection error: ' + err.message);
            return false;
        }
    }

    setupEventListeners() {
        // Navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-section]')) {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.showSection(section);
            }
            
            // Refresh buttons
            if (e.target.matches('[data-refresh]')) {
                e.preventDefault();
                const section = e.target.dataset.refresh;
                this.loadSectionData(section);
            }
        });
    }

    showSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const navItem = document.querySelector(`[data-section="${section}"]`);
        if (navItem) navItem.classList.add('active');

        // Update content sections
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });
        const sectionEl = document.getElementById(`section-${section}`);
        if (sectionEl) sectionEl.classList.add('active');

        this.currentSection = section;
        console.log(`📄 Switched to ${section}`);
    }

    async loadSectionData(section) {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            switch (section) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'main-categories':
                    await this.loadMainCategories();
                    break;
                case 'subcategories':
                    await this.loadSubcategories();
                    break;
                case 'products':
                    await this.loadProducts();
                    break;
                case 'sections':
                    await this.loadSections();
                    break;
                case 'media':
                    await this.loadMedia();
                    break;
            }
        } catch (error) {
            this.showError(`Error loading ${section}: ` + error.message);
        } finally {
            this.isLoading = false;
        }
    }

    async loadDashboard() {
        console.log('📊 Loading dashboard...');
        
        try {
            // Load stats
            const [productsResult, subcategoriesResult, mainCategoriesResult, sectionsResult] = await Promise.all([
                supabase.from('products').select('id, active, featured'),
                supabase.from('subcategories').select('slug, active'),
                supabase.from('main_categories').select('slug, active'),
                supabase.from('sections').select('key')
            ]);

            const stats = {
                totalProducts: productsResult.data?.length || 0,
                activeProducts: productsResult.data?.filter(p => p.active).length || 0,
                featuredProducts: productsResult.data?.filter(p => p.featured).length || 0,
                totalSubcategories: subcategoriesResult.data?.length || 0,
                activeSubcategories: subcategoriesResult.data?.filter(s => s.active).length || 0,
                mainCategories: mainCategoriesResult.data?.length || 0,
                sections: sectionsResult.data?.length || 0
            };

            // Update dashboard UI if elements exist
            const dashboardElement = document.getElementById('dashboard-stats') || 
                                  document.querySelector('.dashboard-stats') ||
                                  document.querySelector('#section-dashboard .stats-container');
            
            if (dashboardElement) {
                dashboardElement.innerHTML = `
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalProducts}</div>
                        <div class="stat-label">Total Products</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.activeProducts}</div>
                        <div class="stat-label">Active Products</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.featuredProducts}</div>
                        <div class="stat-label">Featured Products</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalSubcategories}</div>
                        <div class="stat-label">Subcategories</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.mainCategories}</div>
                        <div class="stat-label">Main Categories</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.sections}</div>
                        <div class="stat-label">Website Sections</div>
                    </div>
                `;
            }

            console.log('✅ Dashboard loaded:', stats);
        } catch (error) {
            this.showError('Dashboard load error: ' + error.message);
        }
    }

    async loadMainCategories() {
        console.log('📂 Loading main categories...');
        
        try {
            const { data, error } = await supabase
                .from('main_categories')
                .select('*')
                .order('sort_order');

            if (error) throw error;

            const tableElement = document.getElementById('main-categories-table') ||
                               document.querySelector('#section-main-categories .table-container');
            
            if (!tableElement) {
                console.warn('Main categories table element not found');
                return;
            }

            if (!data || data.length === 0) {
                tableElement.innerHTML = '<div class="empty-state">No main categories found</div>';
                return;
            }

            tableElement.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Slug</th>
                            <th>Title (EN)</th>
                            <th>Title (AR)</th>
                            <th>Sort Order</th>
                            <th>Status</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(cat => `
                            <tr>
                                <td><code>${cat.slug}</code></td>
                                <td>${cat.title_en || '-'}</td>
                                <td>${cat.title_ar || '-'}</td>
                                <td>${cat.sort_order}</td>
                                <td class="status-${cat.active ? 'active' : 'inactive'}">
                                    ${cat.active ? '✅ Active' : '❌ Inactive'}
                                </td>
                                <td>${new Date(cat.created_at).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            console.log(`✅ Loaded ${data.length} main categories`);
        } catch (error) {
            this.showError('Main categories error: ' + error.message);
        }
    }

    async loadSubcategories() {
        console.log('📁 Loading subcategories...');
        
        try {
            const { data, error } = await supabase
                .from('subcategories')
                .select('*')
                .order('category_type, sort_order');

            if (error) throw error;

            const tableElement = document.getElementById('subcategories-table') ||
                               document.querySelector('#section-subcategories .table-container');
            
            if (!tableElement) {
                console.warn('Subcategories table element not found');
                return;
            }

            if (!data || data.length === 0) {
                tableElement.innerHTML = '<div class="empty-state">No subcategories found</div>';
                return;
            }

            tableElement.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Slug</th>
                            <th>Type</th>
                            <th>Title (EN)</th>
                            <th>Title (AR)</th>
                            <th>Sort Order</th>
                            <th>Status</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(sub => `
                            <tr>
                                <td><code>${sub.slug}</code></td>
                                <td><span class="badge badge-${sub.category_type}">${sub.category_type}</span></td>
                                <td>${sub.title_en || '-'}</td>
                                <td>${sub.title_ar || '-'}</td>
                                <td>${sub.sort_order}</td>
                                <td class="status-${sub.active ? 'active' : 'inactive'}">
                                    ${sub.active ? '✅ Active' : '❌ Inactive'}
                                </td>
                                <td>${new Date(sub.created_at).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            console.log(`✅ Loaded ${data.length} subcategories`);
        } catch (error) {
            this.showError('Subcategories error: ' + error.message);
        }
    }

    async loadProducts() {
        console.log('🥫 Loading products...');
        
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('id');

            if (error) throw error;

            const tableElement = document.getElementById('products-table') ||
                               document.querySelector('#section-products .table-container');
            
            if (!tableElement) {
                console.warn('Products table element not found');
                return;
            }

            if (!data || data.length === 0) {
                tableElement.innerHTML = '<div class="empty-state">No products found</div>';
                return;
            }

            tableElement.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name (EN)</th>
                            <th>Name (AR)</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Featured</th>
                            <th>Status</th>
                            <th>Image</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(product => `
                            <tr>
                                <td><strong>#${product.id}</strong></td>
                                <td>${product.name_en || '-'}</td>
                                <td>${product.name_ar || '-'}</td>
                                <td><span class="badge badge-${product.main_type}">${product.main_type}</span></td>
                                <td><code>${product.sub_slug || '-'}</code></td>
                                <td>${product.featured ? '⭐ Yes' : ''}</td>
                                <td class="status-${product.active ? 'active' : 'inactive'}">
                                    ${product.active ? '✅ Active' : '❌ Inactive'}
                                </td>
                                <td>${product.image_url ? '🖼️ Yes' : '-'}</td>
                                <td>${new Date(product.created_at).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            console.log(`✅ Loaded ${data.length} products`);
        } catch (error) {
            this.showError('Products error: ' + error.message);
        }
    }

    async loadSections() {
        console.log('📄 Loading website sections...');
        
        try {
            const { data, error } = await supabase
                .from('sections')
                .select('*')
                .order('sort_order');

            if (error) throw error;

            const tableElement = document.getElementById('sections-table') ||
                               document.querySelector('#section-sections .table-container');
            
            if (!tableElement) {
                console.warn('Sections table element not found');
                return;
            }

            if (!data || data.length === 0) {
                tableElement.innerHTML = '<div class="empty-state">No sections found</div>';
                return;
            }

            tableElement.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Title (EN)</th>
                            <th>Title (AR)</th>
                            <th>Content Preview</th>
                            <th>Sort Order</th>
                            <th>Image</th>
                            <th>Modified</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(section => `
                            <tr>
                                <td><code>${section.key}</code></td>
                                <td>${section.title_en || '-'}</td>
                                <td>${section.title_ar || '-'}</td>
                                <td title="${section.content_en || ''}">
                                    ${section.content_en ? section.content_en.substring(0, 50) + '...' : '-'}
                                </td>
                                <td>${section.sort_order || 0}</td>
                                <td>${section.image_url ? '🖼️ Yes' : '-'}</td>
                                <td>${new Date(section.updated_at).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            console.log(`✅ Loaded ${data.length} sections`);
        } catch (error) {
            this.showError('Sections error: ' + error.message);
        }
    }

    async loadMedia() {
        console.log('🖼️ Loading media files...');
        
        try {
            const { data, error } = await supabase
                .from('media')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            const tableElement = document.getElementById('media-table') ||
                               document.querySelector('#section-media .table-container');
            
            if (!tableElement) {
                console.warn('Media table element not found');
                return;
            }

            if (!data || data.length === 0) {
                tableElement.innerHTML = '<div class="empty-state">No media files found</div>';
                return;
            }

            tableElement.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>File Name</th>
                            <th>Path</th>
                            <th>Size</th>
                            <th>Type</th>
                            <th>Linked To</th>
                            <th>Uploaded</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(media => `
                            <tr>
                                <td><code>${media.id.substring(0, 8)}...</code></td>
                                <td>${media.file_name || '-'}</td>
                                <td><code>${media.file_path || '-'}</code></td>
                                <td>${media.file_size ? (media.file_size / 1024).toFixed(1) + ' KB' : '-'}</td>
                                <td><span class="badge">${media.mime_type || '-'}</span></td>
                                <td>${media.linked_type ? `${media.linked_type}:${media.linked_id}` : '-'}</td>
                                <td>${new Date(media.created_at).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            console.log(`✅ Loaded ${data.length} media files`);
        } catch (error) {
            this.showError('Media error: ' + error.message);
        }
    }

    showError(message) {
        console.error('❌', message);
        
        // Try to show error in UI if error element exists
        const errorElement = document.getElementById('error-message') ||
                           document.querySelector('.error-message') ||
                           document.querySelector('.status-message');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.className = 'error-message visible';
            setTimeout(() => {
                errorElement.className = 'error-message';
            }, 5000);
        }
        
        // Also alert for now
        alert('Error: ' + message);
    }

    showSuccess(message) {
        console.log('✅', message);
        
        const successElement = document.getElementById('success-message') ||
                             document.querySelector('.success-message') ||
                             document.querySelector('.status-message');
        
        if (successElement) {
            successElement.textContent = message;
            successElement.className = 'success-message visible';
            setTimeout(() => {
                successElement.className = 'success-message';
            }, 3000);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.karamAdmin = new KaramAdmin();
});

// Export for external access
export default KaramAdmin;
