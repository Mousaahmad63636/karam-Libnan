# Main Categories Descriptions Feature

## Overview
Added description functionality to main categories that can be managed from the admin panel. This allows administrators to add descriptive text for each main category that will be displayed on the frontend.

## Changes Made

### 1. Database Schema
The feature expects these fields to be added to the `main_categories` table:
- `description_en` (TEXT) - English description
- `description_ar` (TEXT) - Arabic description

### 2. Admin Panel Updates (`admin.html`)

#### Form Updates:
- **Add Main Category Form**: Added description fields (English & Arabic) with textarea inputs
- **Edit Main Category Form**: Added description fields that populate with existing data
- **Save Function**: Updated to handle description fields in the data object

#### Table Display:
- **Main Categories Table**: Added description columns showing truncated descriptions (50 characters)
- **CSS Styling**: Added `.description-cell` styling for better presentation

### 3. Frontend Updates (`js/app.js`)

#### Banner Enhancement:
- **updateBanner() Function**: Modified to display main category descriptions
- **Structure**: Changed banner HTML to include title and description
- **Localization**: Supports both English and Arabic descriptions based on current language
- **Conditional Display**: Only shows descriptions when viewing "all" subcategory

### 4. CSS Updates (`css/styles.css`)

#### Banner Styling:
- **`.banner-content`**: Container for banner title and description
- **`.banner-title`**: Styling for the main category title
- **`.banner-description`**: Styling for the description text with proper typography

#### Admin Panel Styling:
- **`.description-cell`**: Styling for description columns in admin tables

## Usage

### For Administrators:
1. Go to Admin Panel → Main Categories
2. Click "Add" or "Edit" on any main category
3. Fill in the description fields in English and/or Arabic
4. Save the category

### For Users:
- Descriptions appear in the category banner when viewing "All" products in a main category
- Descriptions are automatically localized based on the selected language
- Descriptions provide context about what types of products are in each category

## Technical Details

### Data Flow:
1. Admin enters descriptions through the admin panel forms
2. Data is saved to Supabase `main_categories` table
3. Frontend loads main categories with descriptions from database
4. Banner displays appropriate description based on current language and category

### Localization:
- English descriptions show when language is set to English
- Arabic descriptions show when language is set to Arabic (if available)
- Falls back to English description if Arabic is not available
- Supports RTL text direction for Arabic content

## Files Modified:
- `admin.html` - Admin panel forms and table display
- `js/app.js` - Frontend banner functionality
- `css/styles.css` - Styling for banner and admin table

## Database Migration Required:
```sql
ALTER TABLE main_categories 
ADD COLUMN description_en TEXT,
ADD COLUMN description_ar TEXT;
```

This feature enhances the user experience by providing contextual information about product categories while maintaining the existing functionality.
