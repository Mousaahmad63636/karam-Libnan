# Dynamic Main Categories - Implementation Guide

## Overview
Main categories ("Single Serve Products", "Bulk Products") are now dynamic and manageable from the admin panel. You can add, edit, delete, and reorder main categories as needed.

## Database Setup

### Step 1: Run Database Migration
Execute the following SQL in your Supabase SQL Editor:

```sql
-- See main-categories-migration.sql file for complete migration
-- This will create the main_categories table and update constraints
```

**Important**: Run `main-categories-migration.sql` in Supabase SQL Editor first!

### Step 2: Verify Migration
After running the migration, verify:
- `main_categories` table exists
- Default categories "single" and "bulk" are inserted
- Foreign key constraints are updated on `products` and `subcategories` tables

## Frontend Changes (Already Applied)

### Main Changes Made:
1. **Dynamic Tab Generation**: Main category tabs are now generated from database
2. **Dynamic Subcategory Containers**: Subcategory filters adapt to available main categories  
3. **Flexible Category System**: Supports any number of main categories
4. **Backward Compatibility**: Falls back to default categories if database is unavailable

### Key Files Modified:
- `js/app.js`: Added dynamic category loading and rendering
- `index.html`: Removed hardcoded category tabs
- `admin.html`: Added main categories management section
- `js/admin.js`: Added CRUD operations for main categories

## Admin Panel Usage

### Access Main Categories Management:
1. Login to admin panel (`admin.html`)
2. Click "Main Categories" in sidebar navigation
3. Manage categories with full CRUD operations:
   - **Add**: Click "Add Main Category" button
   - **Edit**: Click "Edit" button next to any category
   - **Delete**: Click "Delete" button (with confirmation)
   - **Reorder**: Use sort_order field to control display order

### Main Category Fields:
- **Title (English)**: Display name in English (required)
- **Title (Arabic)**: Display name in Arabic (optional)
- **Slug**: URL-friendly identifier (required, unique)
- **Sort Order**: Display order (0 = first)
- **Status**: Active/Inactive toggle

### Important Notes:
- **Slug** is permanent identifier - changing it affects products/subcategories
- **Sort Order** controls display order in frontend tabs
- **Deleting** a main category may affect existing products and subcategories
- System will show warnings before destructive operations

## Frontend Behavior

### How It Works:
1. Page loads → fetches main categories from database
2. Generates main category tabs dynamically  
3. Creates subcategory containers for each main category
4. Users can switch between categories seamlessly
5. All existing functionality (filtering, search) works with new categories

### Example: Adding "Seasonal Products" Category:
1. Go to Admin Panel → Main Categories
2. Click "Add Main Category"
3. Fill form:
   - Title (EN): "Seasonal Products"
   - Title (AR): "منتجات موسمية" 
   - Slug: "seasonal"
   - Sort Order: 3
4. Save → New tab appears automatically on frontend
5. Add subcategories with category_type = "seasonal"
6. Add products with main_type = "seasonal"

## Testing Checklist

### Database Level:
- [ ] Migration runs without errors
- [ ] `main_categories` table created with default data
- [ ] Foreign key constraints applied correctly
- [ ] RLS policies working (public read, admin write)

### Frontend Level:
- [ ] Main category tabs render dynamically
- [ ] Switching between tabs works correctly
- [ ] Subcategory filters show/hide properly
- [ ] Products filter correctly by main category
- [ ] Fallback works if database unavailable

### Admin Level:
- [ ] Main Categories section appears in navigation
- [ ] Can add new main categories
- [ ] Can edit existing categories
- [ ] Can delete categories (with confirmation)
- [ ] Form validation works correctly
- [ ] Changes reflect immediately on frontend

## Troubleshooting

### Common Issues:

**"Main categories not loading"**
- Check Supabase connection
- Verify migration ran successfully
- Check browser console for errors

**"Tabs not appearing"**
- Ensure at least one active main category exists
- Check `mainCategories` variable in browser console
- Verify `buildMainTabs()` function executes

**"Products not filtering correctly"**
- Ensure products have correct `main_type` values
- Check that `main_type` matches main category `slug`
- Verify subcategories have correct `category_type`

**"Admin panel errors"**
- Check Supabase policies allow authenticated access
- Verify form has `data-form="main-category"` attribute
- Check admin.js loads correctly

### Recovery Steps:
If something goes wrong, you can:
1. Re-run the migration SQL
2. Clear browser cache/localStorage
3. Check Supabase logs for errors
4. Reset to default categories manually in database

## Next Steps

### Extending the System:
1. **Add Icons**: Add icon field to main_categories table
2. **Descriptions**: Add description fields for each category
3. **Colors**: Add color theming per category
4. **Permissions**: Add role-based access to categories
5. **Analytics**: Track category usage and performance

### Best Practices:
- Use descriptive slugs that won't need changing
- Keep sort_order increments (10, 20, 30) for easy reordering
- Test category changes on staging before production
- Monitor subcategories/products when deleting categories
- Regular backup before structural changes

## Support
If you encounter issues:
1. Check browser console for JavaScript errors
2. Verify Supabase connection and data
3. Test with simple category first
4. Check all migration steps completed
