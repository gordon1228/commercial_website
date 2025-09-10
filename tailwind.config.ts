import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

// Design System Tokens
const designTokens = {
  colors: {
    // Semantic Color System
    primary: {
      50: '#f8fafc',
      100: '#f1f5f9', 
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
      DEFAULT: '#000000',
    },
    secondary: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb', 
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      DEFAULT: '#6B7280',
    },
    accent: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      DEFAULT: '#E82127',
    },
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      DEFAULT: '#10B981',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      DEFAULT: '#F59E0B',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      DEFAULT: '#EF4444',
    },
    // Surface colors
    background: '#ffffff',
    foreground: '#000000',
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
    muted: {
      50: '#f8fafc',
      100: '#f1f5f9',
      DEFAULT: '#f1f5f9',
      foreground: '#64748b',
    },
    card: {
      DEFAULT: '#ffffff',
      foreground: '#0f172a',
    },
    border: '#e2e8f0',
    input: '#ffffff',
    ring: '#94a3b8',
  },
  typography: {
    // Professional typography scale
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem' }],     // 12px
      'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px  
      'base': ['1rem', { lineHeight: '1.5rem' }],    // 16px
      'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
      'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
      '5xl': ['3rem', { lineHeight: '3.5rem' }],     // 48px
      '6xl': ['3.75rem', { lineHeight: '4rem' }],    // 60px
      '7xl': ['4.5rem', { lineHeight: '5rem' }],     // 72px
      '8xl': ['6rem', { lineHeight: '6.5rem' }],     // 96px
      '9xl': ['8rem', { lineHeight: '8.5rem' }],     // 128px
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
    },
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },
  spacing: {
    // Consistent spacing scale based on 4px grid
    px: '1px',
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px  
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    18: '4.5rem',     // 72px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
    // Custom shadows for design system
    'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    'dialog': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    'dropdown': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
};

// Custom Design System Plugin
const designSystemPlugin = plugin(function({ addComponents, addUtilities, theme }) {
  // Component styles
  addComponents({
    // Enhanced Button Components
    '.btn': {
      '@apply inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200': {},
      '@apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2': {},
      '@apply disabled:pointer-events-none disabled:opacity-50': {},
      '@apply active:scale-95': {},
      height: '2.5rem',
      paddingLeft: '1rem',
      paddingRight: '1rem',
    },
    '.btn-sm': {
      height: '2.25rem',
      paddingLeft: '0.75rem',
      paddingRight: '0.75rem',
      fontSize: '0.875rem',
    },
    '.btn-lg': {
      height: '3rem', 
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
      fontSize: '1rem',
    },
    '.btn-primary': {
      '@apply bg-primary text-white hover:bg-primary/90': {},
      '@apply shadow-sm hover:shadow-md': {},
    },
    '.btn-secondary': {
      '@apply border border-border bg-background hover:bg-muted text-foreground': {},
      '@apply shadow-sm hover:shadow-md': {},
    },
    '.btn-ghost': {
      '@apply hover:bg-muted hover:text-foreground': {},
    },
    '.btn-outline': {
      '@apply border border-border bg-transparent hover:bg-primary hover:text-white': {},
      '@apply shadow-sm': {},
    },
    '.btn-destructive': {
      '@apply bg-error text-white hover:bg-error/90': {},
      '@apply shadow-sm hover:shadow-md': {},
    },
    
    // Enhanced Card Components
    '.card': {
      '@apply rounded-lg border border-border bg-card text-card-foreground': {},
      '@apply shadow-card': {},
    },
    '.card-hover': {
      '@apply transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5': {},
    },
    '.card-header': {
      '@apply flex flex-col space-y-1.5 p-6': {},
    },
    '.card-title': {
      '@apply text-2xl font-semibold leading-none tracking-tight': {},
    },
    '.card-description': {
      '@apply text-sm text-muted-foreground': {},
    },
    '.card-content': {
      '@apply p-6 pt-0': {},
    },
    '.card-footer': {
      '@apply flex items-center p-6 pt-0': {},
    },

    // Enhanced Form Components
    '.input': {
      '@apply flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm': {},
      '@apply file:border-0 file:bg-transparent file:text-sm file:font-medium': {},
      '@apply placeholder:text-muted-foreground': {},
      '@apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring': {},
      '@apply disabled:cursor-not-allowed disabled:opacity-50': {},
    },
    '.input-error': {
      '@apply border-error focus-visible:ring-error': {},
    },
    '.input-success': {
      '@apply border-success focus-visible:ring-success': {},
    },
    '.label': {
      '@apply text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70': {},
    },

    // Loading States
    '.loading-spinner': {
      '@apply animate-spin rounded-full border-2 border-current border-t-transparent': {},
    },
    '.skeleton': {
      '@apply animate-pulse bg-muted rounded': {},
    },

    // Status Components
    '.badge': {
      '@apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold': {},
    },
    '.badge-default': {
      '@apply bg-primary text-white': {},
    },
    '.badge-secondary': {
      '@apply bg-secondary text-white': {},
    },
    '.badge-success': {
      '@apply bg-success text-white': {},
    },
    '.badge-warning': {
      '@apply bg-warning text-white': {},
    },
    '.badge-error': {
      '@apply bg-error text-white': {},
    },
    '.badge-outline': {
      '@apply border border-current text-foreground': {},
    },
  });

  // Utility classes
  addUtilities({
    '.text-gradient': {
      '@apply bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent': {},
    },
    '.surface-elevated': {
      '@apply bg-background shadow-lg': {},
    },
    '.surface-sunken': {
      '@apply bg-muted': {},
    },
    '.animate-in': {
      '@apply animate-scale-in': {},
    },
    '.animate-out': {
      '@apply animate-fade-out': {},
    },
  });
});

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: designTokens.colors,
      fontSize: designTokens.typography.fontSize,
      fontFamily: designTokens.typography.fontFamily,
      fontWeight: designTokens.typography.fontWeight,
      lineHeight: designTokens.typography.lineHeight,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.boxShadow,
      maxWidth: {
        '8xl': '1440px',
        '9xl': '1600px',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-in',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      // Custom breakpoints for better responsive design
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [designSystemPlugin],
};

export default config;
