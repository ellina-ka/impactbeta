/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-teal': '#1D4648',
        'primary-teal': '#3B7073',
        'kpi-green': '#628C84',
        'kpi-blue': '#D8E7F3',
        'kpi-cream': '#FBF6EE',
        'app-bg': '#F7F8FA',
        'surface': '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'accent-red': '#8B3A3A',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
