# Product Management Admin Dashboard

This admin dashboard allows you to manage your product catalog directly from your website. It's fully integrated with your existing site and uses Supabase for authentication and storage.

## Features

- **User Authentication**: Secure login/signup using Supabase Auth
- **Dashboard Overview**: See key statistics about your products
- **Product Management**: Add, edit, delete, and view products
- **Category Management**: Manage product categories
- **JSON Import**: Import products from JSON files
- **Responsive Design**: Works on mobile and desktop
- **Dark Mode Support**: Matches your site's theme

## Setup Instructions

### 1. Supabase Setup

1. Create a free account at [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Authentication > Settings and configure:
   - Enable Email provider
   - Set up any additional providers if needed
4. Go to Project Settings > API to get your:
   - Project URL
   - `anon` public API key
5. Go to Storage and enable storage

### 2. Environment Variables

Create a `.env` file in the project root with the following variables:

```
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Importing Your Existing Product Catalog

There are three ways to import your existing product data:

1. **Automatic Import**: Click the "Import Catalog Files" button on the dashboard to automatically import all JSON files from your product-catalog directory.

2. **JSON Import**: Use the "Import JSON" button on the Products page to upload a JSON file or paste JSON data.

3. **Manual Entry**: Add products one by one using the "Add New Product" form.

## Using the Admin Dashboard

1. Access the dashboard at `/admin`
2. Sign in with your Supabase account
3. Use the sidebar to navigate between different sections:
   - Dashboard: Overview of your products
   - Products: Manage your product catalog
   - Categories: Manage product categories
   - Analytics: View product statistics

## Product Management

- **Add Product**: Click "Add New Product" to create a new product
- **Edit Product**: Click the edit icon on any product to modify it
- **Delete Product**: Click the delete icon to remove a product
- **Import Products**: Use the "Import JSON" button to bulk import products

## Category Management

- **Add Category**: Click "Add New Category" to create a new category
- **Edit Category**: Click the edit icon on any category to modify it
- **Delete Category**: Click the delete icon to remove a category

## Troubleshooting

If you encounter any issues:

1. Check that your Supabase URL and API key are correct in the `.env` file
2. Make sure your Supabase project has authentication and storage enabled
3. Check the browser console for any error messages

## Technical Details

- The admin dashboard uses Supabase for authentication and storage
- Products and categories are stored as JSON files in Supabase storage
- The dashboard is fully integrated with your existing site's theme and styling 