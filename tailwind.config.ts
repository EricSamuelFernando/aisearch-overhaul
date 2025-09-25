import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        'custom-start': 'rgba(25, 7, 0, 0)', 
        'custom-end': '#190700',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        "stepper-active-dark": "rgba(240, 118, 57, 1)",
        "stepper-active-light": "rgb(250, 213, 195)",
        "stepper-inactive": "rgba(214, 196, 184, 1)",
        "text-light": "rgba(113, 113, 113, 1)",
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          main: '#e8804c',
          100: '#faf9f5',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        ocGray: '#f7f7f7',

        ocOrange: '#e8804c',
        light: '#ffffff',
        ocLightOrange: '#ffb576',
        terracotta: '#d16f3e',
        ocGrey: {
          50: '#d6d6d6',
          100: '#CCCCCC',
          150: '#2E2E2E',
        },
        ocYellow: {
          50: '#FFD600',
          100: '#FF8700',
          150: '#FFF3E4',
        },
        grey: {
          50: '#f5f5f5',
          70: '#777777',
          100: '#acacac',
          110: '#2f2f2f',
          130: '#a6b7d1',
          150: '#888',
          170: '#969696',
          190: '#f7f2eb',
          200: '#aaaaaa',
          210: '#c4c4c4',
          230: '#bababa',
          250: '#606060',
          270: '#d0d0d0',
          290: '#8b8b8b',
          300: '#696969',
          310: '#d1e0fe',
          330: '#d2edfe',
          350: '#ada8a8',
          370: '#b5b5b5',
          390: '#f4f4f4',
          400: '#c7c7c7',
          410: '#d1d1d1',
          430: '#f8f8f8',
          450: '#9d9d9d',
          470: '#b9b9b9',
          490: '#3f3f3f',
          510: '#ccc',
          520: '#c9c9c9',
          530: '#d2e2ed',
          550: '#f5f6f9',
          570: '#222',
          580: '#666666',
          590: '#d3d3d3',
          610: '#5c5c5c',
          630: '#eaf2f6F',
          650: '#dee3e6',
          670: '#848484',
          690: '#faf8f5',
          710: '#5a5a5a',
          750: '#8e929c',
          850: '#707070',
          830: '#e4e9f3',
          870: '#dbe2ee',
          890: '#fafcff',
          860: '#a3a3a3',
          880: '#f5f8fa',
          900: '#696969',
          910: '#f6f8fc',
          930: '#edf2f9',
          950: '#7186a9',
          970: '#afafaf',
          990: '#808080',
        },
        ocGreen: {
          50: '#A9ED65',
          100: '#9cd374',
          150: '#71cb6d',
          170: '#e3ffd6',
          180: '#1B5519',
          190: '#CBFFD0',
        },
        ocBlue: {
          50: '#2394da',
          100: '#3468c6',
          250: '#0064e5',
        },
        ocBlack: {
          50: '#454545',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      container: {
        // you can configure the container to be centered
        center: true,
        // or have default horizontal padding
        padding: '3.188rem',
        // default breakpoints but with 40px removed
        //
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1440px',
          '3xl': '2560px',
        },
      },
      fontSize: {
        tiny: '.625rem',
        xs: '0.75rem',
        10: '0.625rem',
        xsm: '0.563rem',
        sm: '.875rem',
        md: '.938rem',
        17: '1.063em',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.5rem',
        '2xl': '1.75rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '4rem',
        '7xl': '5rem',
      },
      height: {
        294: '18.375rem',
        120: '7.5rem',
        22: '1.375rem',
        'screen-nav': 'calc(100vh - 8rem)', // this subtracts the heigh of navbar
      },
      width: {
        35.5: '2.219rem',
        91: '5.688rem',
      },
      spacing: {
        '18.5': '1.156rem',
        '12.5': '0.781rem',
        9: '0.563rem',
        4.1: '0.256rem',
        25: '1.563rem',
        27: '1.688rem',
        30: '1.875rem',
        48.5: '3.063rem',
        6.5: '0.406rem',
        17.5: '1.094rem',
        2.4: '0.15rem',
        19.5: '1.219rem',
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(174.83deg, rgba(25, 7, 0, 0) 4.07%, #190700 55.92%)',
      }
    },
  },
  safelist: [
    {
      pattern: /w-+/,
      // variant:[]
    },
  ],
  plugins: [require('tailwindcss-animate'), require('tailwind-scrollbar'),require('tailwind-scrollbar-hide')
  ],
} satisfies Config;

export default config;
