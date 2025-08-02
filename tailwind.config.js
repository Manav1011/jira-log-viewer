/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'jira-blue': '#2684FF',
        'jira-blue-dark': '#0052CC',
        'jira-green': '#36B37E',
        'jira-red': '#FF5630',
        'jira-yellow': '#FFAB00',
        'jira-bg': '#F4F5F7',
        'jira-border': '#DFE1E6',
        'jira-hover': '#EBECF0',
        'jira-text': '#172B4D',
        'jira-text-secondary': '#5E6C84',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'float': 'float 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}