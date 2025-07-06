/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'blue-50': '#f0f7ff',
        'blue-100': '#e0f2fe',
        'blue-600': '#2563eb',
        'green-100': '#dcfce7',
        'green-600': '#16a34a',
        'yellow-100': '#fef9c3',
        'yellow-600': '#ca8a04',
        'purple-100': '#f3e8ff',
        'purple-600': '#7c3aed',
      },
    },
  },
  plugins: [],
};
