/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: '#C79A00',
          light: '#D4A500',
          dark: '#B38900',
        },
        gold: {
          DEFAULT: '#C79A00',
          light: '#D4A500',
          dark: '#B38900',
        },
        // Charcoal/Black Neutrals
        charcoal: {
          DEFAULT: '#1A1A1D',
          secondary: '#2A2A2F',
          tertiary: '#3A3A3F',
          light: '#4A4A4F',
        },
        // Text Colors
        text: {
          primary: '#EDEDED',
          secondary: '#B8B8B8',
          tertiary: '#9CA3AF',
          dark: '#1A1A1D',
        },
        // Accent Colors
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#F87171',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
        },
        // Surface Colors
        surface: {
          white: '#FFFFFF',
          light: '#F9FAFB',
          gray: '#F3F4F6',
        },
        border: {
          light: '#E5E7EB',
          medium: '#D1D5DB',
          dark: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'monospace'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
        'gold-sm': '0 2px 8px rgba(199, 154, 0, 0.15)',
        'gold-md': '0 4px 15px rgba(199, 154, 0, 0.25)',
        'gold-lg': '0 6px 20px rgba(199, 154, 0, 0.35)',
        'gold-xl': '0 10px 30px rgba(199, 154, 0, 0.4)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      zIndex: {
        base: '1',
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        'modal-backdrop': '1040',
        modal: '1050',
        popover: '1060',
        tooltip: '1070',
      },
      backgroundImage: {
        'gradient-charcoal': 'linear-gradient(135deg, #1A1A1D 0%, #2A2A2F 100%)',
        'gradient-charcoal-fade': 'linear-gradient(135deg, rgba(26, 26, 29, 0.88) 0%, rgba(42, 42, 47, 0.92) 100%)',
        'gradient-gold': 'linear-gradient(135deg, #B38900 0%, #D4A500 100%)',
        'text-gradient-gold': 'linear-gradient(135deg, #C79A00 0%, #D4A500 100%)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '10px',
        lg: '20px',
        xl: '40px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        fadeIn: 'fadeIn 0.25s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
