/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        'go-green': {
          DEFAULT: 'var(--color-go-green)',
          light: 'var(--color-go-green-light)',
          dark: 'var(--color-go-green-dark)',
        },
        'naija-gold': 'var(--color-naija-gold)',
        'alert-red': 'var(--color-alert-red)',
        'trust-blue': 'var(--color-trust-blue)',
        
        // Semantic
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
        
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
        
        // Surfaces
        surface: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          elevated: 'var(--color-bg-elevated)',
          overlay: 'var(--color-bg-overlay)',
        },
        
        // Text
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverted: 'var(--color-text-inverted)',
        },
        
        // Borders
        border: {
          subtle: 'var(--color-border-subtle)',
          DEFAULT: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)',
        },
      },
      
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      
      fontSize: {
        'display-xl': ['var(--text-display-xl-size)', {
          lineHeight: 'var(--text-display-xl-line)',
          letterSpacing: 'var(--text-display-xl-spacing)',
          fontWeight: 'var(--text-display-xl-weight)',
        }],
        'display-lg': ['var(--text-display-lg-size)', {
          lineHeight: 'var(--text-display-lg-line)',
          letterSpacing: 'var(--text-display-lg-spacing)',
          fontWeight: 'var(--text-display-lg-weight)',
        }],
        'display-md': ['var(--text-display-md-size)', {
          lineHeight: 'var(--text-display-md-line)',
          letterSpacing: 'var(--text-display-md-spacing)',
          fontWeight: 'var(--text-display-md-weight)',
        }],
        'heading-lg': ['var(--text-heading-lg-size)', {
          lineHeight: 'var(--text-heading-lg-line)',
          letterSpacing: 'var(--text-heading-lg-spacing)',
          fontWeight: 'var(--text-heading-lg-weight)',
        }],
        'heading-md': ['var(--text-heading-md-size)', {
          lineHeight: 'var(--text-heading-md-line)',
          letterSpacing: 'var(--text-heading-md-spacing)',
          fontWeight: 'var(--text-heading-md-weight)',
        }],
        'heading-sm': ['var(--text-heading-sm-size)', {
          lineHeight: 'var(--text-heading-sm-line)',
          letterSpacing: 'var(--text-heading-sm-spacing)',
          fontWeight: 'var(--text-heading-sm-weight)',
        }],
        'body-lg': ['var(--text-body-lg-size)', {
          lineHeight: 'var(--text-body-lg-line)',
          letterSpacing: 'var(--text-body-lg-spacing)',
          fontWeight: 'var(--text-body-lg-weight)',
        }],
        'body-md': ['var(--text-body-md-size)', {
          lineHeight: 'var(--text-body-md-line)',
          letterSpacing: 'var(--text-body-md-spacing)',
          fontWeight: 'var(--text-body-md-weight)',
        }],
        'body-sm': ['var(--text-body-sm-size)', {
          lineHeight: 'var(--text-body-sm-line)',
          letterSpacing: 'var(--text-body-sm-spacing)',
          fontWeight: 'var(--text-body-sm-weight)',
        }],
        'label': ['var(--text-label-size)', {
          lineHeight: 'var(--text-label-line)',
          letterSpacing: 'var(--text-label-spacing)',
          fontWeight: 'var(--text-label-weight)',
        }],
        'caption': ['var(--text-caption-size)', {
          lineHeight: 'var(--text-caption-line)',
          letterSpacing: 'var(--text-caption-spacing)',
          fontWeight: 'var(--text-caption-weight)',
        }],
      },
      
      spacing: {
        'px': 'var(--spacing-px)',
        '0': 'var(--spacing-0)',
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
      },
      
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        'full': 'var(--radius-full)',
        'button': 'var(--radius-button)',
        'card': 'var(--radius-card)',
        'input': 'var(--radius-input)',
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
        'ease-out': 'var(--ease-out)',
        'ease-in-out': 'var(--ease-in-out)',
        'spring': 'var(--ease-spring)',
      },
      
      zIndex: {
        'base': 'var(--z-base)',
        'elevated': 'var(--z-elevated)',
        'dropdown': 'var(--z-dropdown)',
        'sticky': 'var(--z-sticky)',
        'overlay': 'var(--z-overlay)',
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
}