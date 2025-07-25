/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          // Light theme colors
          'cream': '#FCEED8',
          'light-beige': '#F8F4E8',
          'warm-orange': '#FF6B35',
          'mustard': '#FFA726',
          'burnt-coral': '#FF7043',
          'tan': '#DEB48E',
          // Dark theme colors
          'dark-bg': '#1A1B2E',
          'dark-secondary': '#16213E',
          'dark-card': '#0F3460',
          'dark-border': '#2D3748',
        },
        light: {
          'text-primary': '#2D3748',
          'text-secondary': '#4A5568',
          'bg-primary': '#FCEED8',
          'bg-secondary': '#F8F4E8',
          'card-bg': '#FFFFFF',
          'border': '#E2E8F0',
        },
        dark: {
          'text-primary': '#E2E8F0',
          'text-secondary': '#CBD5E0',
          'bg-primary': '#1A1B2E',
          'bg-secondary': '#16213E',
          'card-bg': '#0F3460',
          'border': '#2D3748',
        },
      },
      backgroundColor: {
        'light-primary': '#FCEED8',
        'light-secondary': '#F8F4E8',
        'light-card': '#FFFFFF',
        'dark-primary': '#1A1B2E',
        'dark-secondary': '#16213E',
        'dark-card': '#0F3460',
      },
      textColor: {
        'light-primary': '#2D3748',
        'light-secondary': '#4A5568',
        'dark-primary': '#E2E8F0',
        'dark-secondary': '#CBD5E0',
      },
      borderColor: {
        'light-border': '#E2E8F0',
        'dark-border': '#2D3748',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'zoom-in': 'zoomIn 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)' },
          '100%': { boxShadow: '0 6px 30px rgba(255, 107, 53, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};