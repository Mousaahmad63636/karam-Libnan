# Karam Libnan Admin Panel Setup Guide

## 🚀 Quick Setup

### 1. Database Setup
1. Open Supabase SQL Editor
2. Run the complete schema: `supabase-schema-complete.sql`
3. This will create all tables, policies, and seed data

### 2. Storage Setup
1. Go to Supabase Storage
2. Create a new bucket named: `karam-libnan`
3. Set bucket to **Public**
4. Enable RLS and add policy:
   ```sql
   create policy "Authenticated users can upload" on storage.objects
   for insert with check (auth.role() = 'authenticated');
   
   create policy "Public can view" on storage.objects
   for select using (bucket_id = 'karam-libnan');
   ```

### 3. Admin User Setup
1. Go to Supabase Auth → Users
2. Create a new user or select existing user
3. Add custom claim in user metadata:
   ```json
   {
     "role": "admin"
   }
   ```

### 4. Access Admin Panel
1. Open `admin.html` in browser
2. Login with admin credentials
3. Start managing content!

## 📊 Admin Panel Features

### ✅ Fully Functional Features
- **Dashboard**: Overview statistics and quick actions
- **Products Management**: Full CRUD with image upload
- **Categories Management**: Subcategories with banner images
- **Sections Management**: Content sections (hero, about, etc.)
- **Authentication**: Secure login with role-based access
- **Image Upload**: Automatic compression and storage
- **Search & Filter**: Real-time product search
- **Responsive Design**: Works on mobile and desktop

### 🎯 Available Operations

#### Products
- ✅ Create new products with images
- ✅ Edit existing products
- ✅ Delete products with confirmation
- ✅ Toggle featured/active status
- ✅ Search products by name
- ✅ Automatic image compression
- ✅ Multi-language support (EN/AR)

#### Subcategories  
- ✅ Create/edit subcategories
- ✅ Upload banner images
- ✅ Set sort order
- ✅ Toggle active status
- ✅ Single/Bulk type classification

#### Content Sections
- ✅ Manage hero, about, contact sections
- ✅ Multi-language content
- ✅ Image attachments
- ✅ Real-time preview

### 🛡️ Security Features
- Row Level Security (RLS) enabled
- Admin role verification
- Secure image upload
- Input validation
- XSS protection

## 🔧 Technical Details

### Database Schema
- **subcategories**: Product categorization
- **products**: Main product catalog  
- **sections**: Website content sections
- **media**: File metadata tracking
- **audit_logs**: Change tracking

### Storage Structure
```
karam-libnan/
├── products/     # Product images
├── banners/      # Category banners  
├── sections/     # Section images
└── general/      # Other media
```

### Authentication Flow
1. User enters credentials
2. Supabase Auth validates
3. JWT token checked for admin role
4. RLS policies enforce access control

## 📱 Usage Examples

### Adding a New Product
1. Click "Add Product" in Products section
2. Fill in English/Arabic names
3. Select main type (Single/Bulk)
4. Choose subcategory
5. Upload product image
6. Add description and ingredients
7. Set featured/active status
8. Click "Save Product"

### Managing Categories
1. Go to Categories section
2. Click "Add Category" 
3. Enter slug (URL-friendly ID)
4. Add English/Arabic titles
5. Upload banner image
6. Set sort order
7. Save category

### Content Management
1. Navigate to Sections
2. Select existing section or create new
3. Edit English/Arabic content
4. Upload section image
5. Save changes
6. Content appears on website immediately

## 🚨 Troubleshooting

### Common Issues

**"Storage bucket not found"**
- Create `karam-libnan` bucket in Supabase Storage
- Set bucket to public
- Add proper RLS policies

**"Permission denied"**
- Check user has `role: admin` in metadata
- Verify RLS policies are correctly set
- Ensure user is authenticated

**"Image upload fails"**
- Check file size (max 4MB)
- Verify file type (JPEG/PNG only)
- Ensure storage bucket exists and is public

**"Tables don't exist"**
- Run `supabase-schema-complete.sql` in SQL Editor
- Check all tables were created successfully
- Verify extensions are enabled

### Support
- Check browser console for detailed error messages
- Review Supabase logs for backend issues
- Ensure all environment variables are set correctly

## ✨ What's Next?

The admin panel is fully functional and ready for production use. You can:

1. **Start adding products** - Use the Products section to build your catalog
2. **Customize categories** - Add your specific subcategories and banners  
3. **Update content** - Modify hero, about, and other website sections
4. **Manage media** - Upload and organize your product images
5. **Monitor activity** - Use the dashboard to track your content

Your website will automatically reflect all changes made through the admin panel!
