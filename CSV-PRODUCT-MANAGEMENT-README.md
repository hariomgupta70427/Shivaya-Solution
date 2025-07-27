# CSV-Based Product Management System

This system allows you to manage your product catalog through a user-friendly admin dashboard. All product data is stored in CSV format in Supabase storage, making it easy to edit, import, and export.

## Features

- **CSV-Based Storage**: All product data is stored as CSV files in Supabase storage
- **Multiple Import Options**: Import products from JSON files, CSV files, or manual entry
- **Admin Dashboard**: Manage products through an intuitive admin interface
- **Category Management**: Organize products by categories
- **Real-time Updates**: Changes made in the admin dashboard are immediately reflected on the public site
- **Responsive Design**: Works on both desktop and mobile devices

## Setup Instructions

1. **Supabase Setup**:
   - Create a free account at [Supabase](https://supabase.com/)
   - Create a new project
   - Go to Project Settings > API to get your:
     - Project URL
     - `anon` public API key
   - Go to Storage and enable storage

2. **Environment Variables**:
   - Create a `.env` file in the project root with the following variables:
   ```
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Initial Setup**:
   - When you first run the application, it will automatically:
     - Create a storage bucket named `product-data` in your Supabase project
     - Convert your existing JSON product catalog to CSV format
     - Upload the CSV data to Supabase storage

## Using the Admin Dashboard

1. **Accessing the Dashboard**:
   - Go to `/admin` to access the admin dashboard
   - Sign in with your Supabase account credentials

2. **Managing Products**:
   - **View Products**: See all products in a sortable, filterable table
   - **Add Product**: Click "Add New Product" to create a new product
   - **Edit Product**: Click the edit icon on any product to modify it
   - **Delete Product**: Click the delete icon to remove a product
   - **Import Products**: Multiple options for importing products (see below)

3. **Managing Categories**:
   - **View Categories**: See all categories in a table
   - **Add Category**: Click "Add New Category" to create a new category
   - **Edit Category**: Click the edit icon on any category to modify it
   - **Delete Category**: Click the delete icon to remove a category

## Importing Products

You can import products in several ways:

1. **Import CSV File** (New!):
   - Click the "Import CSV File" button on the Dashboard
   - Select a CSV file from your computer
   - The system will automatically import the products

2. **Convert JSON to CSV** (New!):
   - Click the "Convert JSON to CSV" button on the Dashboard
   - This will scan the `product-catalog` directory for JSON files
   - Convert them to CSV format and import them into the system

3. **Import JSON/CSV via Modal**:
   - Click the "Import JSON" button on the Products page
   - Upload a JSON or CSV file or paste data
   - Select the appropriate format (JSON or CSV)
   - The system will import the products

4. **Import Catalog Files**:
   - Click the "Import Catalog Files" button on the Dashboard
   - This will automatically import products from the default catalog files

## CSV Format

The product CSV file has the following columns:

- `id`: Unique identifier for the product
- `name`: Product name
- `category`: Product category
- `subcategory`: Product subcategory (optional)
- `description`: Product description
- `price`: Product price (optional)
- `image_url`: URL to the product image (optional)
- `in_stock`: Whether the product is in stock (true/false)
- `created_at`: Date the product was created
- `updated_at`: Date the product was last updated

## Converting JSON to CSV

If you have existing JSON product data, you can:

1. Place your JSON files in the `product-catalog` directory
2. Run `npm run convert-json` to convert them to CSV files
3. The converted files will be saved in the `csv-output` directory
4. You can then import these CSV files using the "Import CSV File" button

## Exporting Products

Currently, direct export is not implemented, but you can access your product data by:

1. Going to your Supabase dashboard
2. Navigating to Storage > Buckets > product-data
3. Downloading the `products.csv` file

## Troubleshooting

If you encounter any issues:

1. **Dashboard Not Loading**:
   - Check that your Supabase URL and API key are correct in the `.env` file
   - Make sure your Supabase project has storage enabled

2. **Products Not Showing**:
   - Check the browser console for any error messages
   - Verify that the products were successfully imported into Supabase storage

3. **Import Errors**:
   - Ensure your JSON or CSV data is properly formatted
   - Check for any error messages displayed during import

4. **CSV Parsing Errors**:
   - Make sure your CSV file has the correct headers
   - Check that there are no special characters causing parsing issues
   - Try opening and saving the CSV file in a spreadsheet program like Excel or Google Sheets

## Technical Details

- The system uses Supabase for authentication and storage
- Products and categories are stored as CSV files in Supabase storage
- The PapaParse library is used for CSV parsing and generation
- The dashboard is built with React and styled with Tailwind CSS 