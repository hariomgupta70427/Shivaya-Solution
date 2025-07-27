# Product Management Admin Dashboard

This is a fully functional admin dashboard for managing products, integrated with Supabase for authentication and Baserow for the database backend.

## Features

- **User Authentication**: Secure login/signup using Supabase Auth
- **Dashboard**: Overview of product statistics and quick actions
- **Product Management**: Add, edit, delete, and view products
- **Category Management**: Manage product categories
- **Analytics**: Simple analytics dashboard with product statistics
- **Responsive Design**: Mobile-friendly interface
- **Dark Mode Support**: Seamless integration with the site's theme

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

### 2. Baserow Setup

1. Create a free account at [Baserow](https://baserow.io/)
2. Create a new database
3. Create a table for Products with the following fields:
   - `id` (Auto-increment number)
   - `name` (Text)
   - `category` (Text)
   - `subcategory` (Text, optional)
   - `description` (Long text)
   - `price` (Number, optional)
   - `image_url` (Text, optional)
   - `in_stock` (Boolean, default true)
   - `created_at` (Date/time with timezone)
   - `updated_at` (Date/time with timezone)
4. Optionally, create a Categories table with:
   - `id` (Auto-increment number)
   - `name` (Text)
   - `description` (Text, optional)
   - `icon` (Text, optional)
5. Get your Baserow API key from Account > API tokens
6. Note your table IDs from the URL when viewing each table

### 3. Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Baserow API Configuration
VITE_BASEROW_API_URL=https://api.baserow.io
VITE_BASEROW_API_KEY=your-baserow-api-key
VITE_BASEROW_TABLE_ID=your-products-table-id

# Optional: If you have a separate categories table
VITE_BASEROW_CATEGORY_TABLE_ID=your-categories-table-id
```

### 4. Running the Project

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Access the admin dashboard at:
   ```
   http://localhost:5173/admin
   ```

### 5. Deployment

The project can be deployed to Vercel, Netlify, or Cloudflare Pages:

1. Connect your repository to your preferred platform
2. Set the environment variables in the platform's settings
3. Deploy!

## Image Hosting Options

For product images, you can use any of these free image hosting services:

1. **ImgBB**: Free image hosting with API
   - Sign up at [ImgBB](https://imgbb.com/)
   - Get an API key and use their upload API

2. **Cloudinary**: Free tier with generous limits
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Use their upload widget or direct API

3. **Firebase Storage**: If you're already using Firebase
   - Set up Firebase Storage
   - Use their SDK for uploads

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Baserow Documentation](https://baserow.io/docs)
- [React Router Documentation](https://reactrouter.com/en/main)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Customization

- Modify the color scheme in `tailwind.config.js`
- Add additional fields to the product form in `ProductForm.tsx`
- Extend analytics in `Analytics.tsx` 