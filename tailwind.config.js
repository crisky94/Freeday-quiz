/** @type {import('tailwindcss').Config} */
export const content = [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
];
export const theme = {
  extend: {
    colors: {
      primary: '#fcff00',
      secundary: '#23FFDD',
      hackBlack: '#111111',
      hackYellow: '#d4d703',
    },
    backgroundImage: {
      'custom-linear': 'linear-gradient(90deg, rgba(28, 255, 228, 1) 0%, rgba(252, 255, 0, 1) 100%)',
    },
  },
};
export const plugins = [];
