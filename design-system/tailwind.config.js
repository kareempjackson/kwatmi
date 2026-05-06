/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Palette
        'go-green': {
          DEFAULT: 'var(--color-go-green)',
          light: 'var(--color-go-green-light)',
          dark: 'var(--color-go-green-dark)',
        },
        'lagos-gold': {
          DEFAULT: 'var(--color-lagos-gold)',
          light: 'var(--color-lagos-gold-light)',
          dark: 'var(--color-lagos-gold-dark)',
        },
        'okada-orange': 'var(--color-okada-orange)',
        'keke-yellow': 'var(--color-keke-yellow)',
        'alert-red': {
          DEFAULT: 'var(--color-alert-red)',
          light: 'var(--color-alert-red-light)',
        },
        'sky-blue': 'var(--color-sky-blue)',
        
        // Neutrals
        neutral: {
          950: 'var(--color-neutral-950)',
          900: 'var(--color-neutral-900)',
          800: 'var(--color-neutral-800)',
          700: 'var(--color-neutral-700)',
          600: 'var(--color-neutral-600)',
          500: 'var(--color-neutral-500)',
          400: 'var(--color-neutral-400)',
          300: 'var(--color-neutral-300)',
          200: 'var(--color-neutral-200)',
          100: 'var(--color-neutral-100)',
          50: 'var(--color-neutral-50)',
        },
        
        // Semantic
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          elevated: 'var(--color-bg-elevated)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          disabled: 'var(--color-text-disabled)',
          inverse: 'var(--color-text-inverse)',
        },
        border: {
          DEFAULT: 'var(--color-border-default)',
          subtle: 'var(--color-border-subtle)',
          strong: 'var(--color-border-strong)',
        },
        status: {
          success: 'var(--color-status-success)',
          warning: 'var(--color-status-warning)',
          error: 'var(--color-status-error)',
          info: 'var(--color-status-info)',
        },
      },
      
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        mono: ['var(--font-family-mono)'],
      },
      
      fontSize: {
        'display-xl': ['var(--text-display-xl)', {
          lineHeight: 'var(--text-display-xl-line)',
          letterSpacing: 'var(--text-display-xl-tracking)',
          fontWeight: 'var(--text-display-xl-weight)',
        }],
        'display-lg': ['var(--text-display-lg)', {
          lineHeight: 'var(--text-display-lg-line)',
          letterSpacing: 'var(--text-display-lg-tracking)',
          fontWeight: 'var(--text-display-lg-weight)',
        }],
        'display-md': ['var(--text-display-md)', {
          lineHeight: 'var(--text-display-md-line)',
          letterSpacing: 'var(--text-display-md-tracking)',
          fontWeight: 'var(--text-display-md-weight)',
        }],
        'heading-lg': ['var(--text-heading-lg)', {
          lineHeight: 'var(--text-heading-lg-line)',
          letterSpacing: 'var(--text-heading-lg-tracking)',
          fontWeight: 'var(--text-heading-lg-weight)',
        }],
        'heading-md': ['var(--text-heading-md)', {
          lineHeight: 'var(--text-heading-md-line)',
          letterSpacing: 'var(--text-heading-md-tracking)',
          fontWeight: 'var(--text-heading-md-weight)',
        }],
        'heading-sm': ['var(--text-heading-sm)', {
          lineHeight: 'var(--text-heading-sm-line)',
          letterSpacing: 'var(--text-heading-sm-tracking)',
          fontWeight: 'var(--text-heading-sm-weight)',
        }],
        'body-lg': ['var(--text-body-lg)', {
          lineHeight: 'var(--text-body-lg-line)',
          letterSpacing: 'var(--text-body-lg-tracking)',
          fontWeight: 'var(--text-body-lg-weight)',
        }],
        'body-md': ['var(--text-body-md)', {
          lineHeight: 'var(--text-body-md-line)',
          letterSpacing: 'var(--text-body-md-tracking)',
          fontWeight: 'var(--text-body-md-weight)',
        }],
        'body-sm': ['var(--text-body-sm)', {
          lineHeight: 'var(--text-body-sm-line)',
          letterSpacing: 'var(--text-body-sm-tracking)',
          fontWeight: 'var(--text-body-sm-weight)',
        }],
        'label': ['var(--text-label)', {
          lineHeight: 'var(--text-label-line)',
          letterSpacing: 'var(--text-label-tracking)',
          fontWeight: 'var(--text-label-weight)',
        }],
        'caption': ['var(--text-caption)', {
          lineHeight: 'var(--text-caption-line)',
          letterSpacing: 'var(--text-caption-tracking)',
          fontWeight: 'var(--text-caption-weight)',
        }],
      },
      
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
        '4xl': 'var(--spacing-4xl)',
        '5xl': 'var(--spacing-5xl)',
        'touch': 'var(--spacing-touch-min)',
        'touch-comfortable': 'var(--spacing-touch-comfortable)',
      },
      
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        'full': 'var(--radius-full)',
      },
      
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glow-green': 'var(--shadow-glow-green)',
        'glow-gold': 'var(--shadow-glow-gold)',
      },
      
      transitionDuration: {
        'instant': 'var(--duration-instant)',
        'fast': 'var(--duration-fast)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
        'slower': 'var(--duration-slower)',
      },
      
      transitionTimingFunction: {
        'out': 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
        'spring': 'var(--ease-spring)',
        'bounce': 'var(--ease-bounce)',
      },
      
      zIndex: {
        'base': 'var(--z-base)',
        'raised': 'var(--z-raised)',
        'dropdown': 'var(--z-dropdown)',
        'sticky': 'var(--z-sticky)',
        'modal': 'var(--z-modal)',
        'toast': 'var(--z-toast)',
        'tooltip': 'var(--z-tooltip)',
      },
      
      minHeight: {
        'touch': 'var(--spacing-touch-min)',
      },
      
      minWidth: {
        'touch': 'var(--spacing-touch-min)',
      },
    },
  },
  plugins: [],
};