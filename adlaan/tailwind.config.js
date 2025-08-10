/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ["var(--font-cairo)", "Cairo", "sans-serif"],
      },
      direction: {
        rtl: "rtl",
        ltr: "ltr",
      },
      spacing: {
        'rtl-safe': '0.5rem',
      },
    },
  },
  plugins: [
    function ({ addUtilities, addComponents }) {
      const newUtilities = {
        '.dir-rtl': {
          direction: 'rtl',
        },
        '.dir-ltr': {
          direction: 'ltr',
        },
        '.text-right-rtl': {
          'text-align': 'right',
        },
        '.text-left-rtl': {
          'text-align': 'left',
        },
        '.gap-rtl': {
          gap: '1rem',
        },
        '.space-x-rtl > :not([hidden]) ~ :not([hidden])': {
          '--tw-space-x-reverse': '1',
          'margin-right': 'calc(1rem * var(--tw-space-x-reverse))',
          'margin-left': 'calc(1rem * calc(1 - var(--tw-space-x-reverse)))',
        },
      }
      
      const newComponents = {
        '.btn-rtl': {
          'font-family': 'var(--font-cairo), Cairo, sans-serif',
          'font-weight': '500',
          'text-align': 'center',
        },
        '.card-rtl': {
          'text-align': 'right',
          'direction': 'rtl',
        },
      }
      
      addUtilities(newUtilities)
      addComponents(newComponents)
    }
  ],
}
