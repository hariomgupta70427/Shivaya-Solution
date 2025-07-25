# Shivaya Solution - Official Website

This repository contains the official website for Shivaya Solution, a company specializing in high-quality plastic products. The website is built using modern web technologies to provide an optimal user experience across all devices.

## Project Overview

This is a paid project developed for Shivaya Solution to showcase their products, company information, and provide easy contact methods for potential customers. The website features a responsive design with both light and dark themes to enhance user accessibility and preference.

## Features

- **Responsive Design**: Optimized for mobile, tablet, and desktop experiences
- **Light/Dark Theme**: User-selectable theme with system preference detection
- **Product Catalog**: Comprehensive catalog with categories and subcategories
- **Contact Form**: Direct communication channel for inquiries and quotes
- **Modern UI**: Smooth animations and transitions for an engaging user experience

## Tech Stack

- **React**: Frontend library for building the user interface
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for smooth transitions
- **React Router**: For handling navigation and routing
- **Vite**: Build tool for fast development and optimized production builds

## Site Structure

The website consists of several key sections:

### Home
The landing page that showcases the company's highlights, featured products, and unique selling points.

### Products
The product catalog section is organized into:

- **Categories**: Main product categories (e.g., Buckets, Containers, Kitchen Items)
- **Subcategories**: Further classification of products within each category
- **Product Details**: Comprehensive information about each product including:
  - High-quality images
  - Detailed specifications
  - Available sizes and colors
  - Usage instructions
  - Related products

The product catalog implements a filtering system allowing users to narrow down their search by various attributes such as size, color, and application.

### About
Information about Shivaya Solution, including:
- Company history
- Mission and vision
- Team members
- Manufacturing processes
- Quality standards

### Contact
Multiple channels for reaching out to the company:
- Contact form for direct inquiries
- Business hours
- Email and phone contact information
- Social media links

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Contact/        # Contact-related components
│   ├── Layout/         # Layout components (Header, Footer)
│   └── Products/       # Product listing and details components
├── hooks/              # Custom React hooks
├── pages/              # Main page components
├── services/           # API and external services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and constants
```

## Theme Implementation

The website implements a dual-theme system:

- **Light Theme**: Cream/white background with dark text, providing a clean and professional appearance
- **Dark Theme**: Deep blue background with light text, reducing eye strain in low-light environments

The theme system includes:
- Automatic detection of user's system preference
- Manual toggle via the header
- Persistent theme selection using localStorage
- Smooth transition between themes

## Development

This project uses npm for package management:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Acknowledgments

This project was developed as a paid engagement for Shivaya Solution, with all design and implementation rights transferred as per the contract agreement.

---

© 2025 Shivaya Solution. All rights reserved.

