/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        gold: {
          DEFAULT: 'hsl(var(--gold))',
          foreground: 'hsl(var(--gold-foreground))'
        },
        silver: {
          DEFAULT: 'hsl(var(--silver))',
          foreground: 'hsl(var(--silver-foreground))'
        },
        bronze: {
          DEFAULT: 'hsl(var(--bronze))',
          foreground: 'hsl(var(--bronze-foreground))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'fadeIn': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)' 
          }
        },
        'pulse-slow': {
          '0%, 100%': { 
            opacity: '0.8' 
          },
          '50%': { 
            opacity: '0.4' 
          }
        },
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '0.5',
            boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.8)'
          }
        },
        'light-sweep': {
          '0%': {
            left: '-20%',
            opacity: '0'
          },
          '50%': {
            opacity: '0.7'
          },
          '100%': {
            left: '120%',
            opacity: '0'
          }
        },
        'rank-appear': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.5)'
          },
          '50%': {
            opacity: '0.5',
            transform: 'scale(1.2)'
          },
          '100%': {
            opacity: '0.8',
            transform: 'scale(1)'
          }
        },
        'bottom-fade': {
          '0%, 100%': {
            opacity: '0.7',
            height: '33%'
          },
          '50%': {
            opacity: '0.9',
            height: '40%'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fadeIn': 'fadeIn 1s ease-out',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'light-sweep': 'light-sweep 4s ease-in-out infinite',
        'rank-appear': 'rank-appear 1.2s ease-out',
        'bottom-fade': 'bottom-fade 4s ease-in-out infinite'
      }
    }
  },
  plugins: [],
}
