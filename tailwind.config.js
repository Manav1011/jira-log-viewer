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
        // V2 Design System Tokens
        'v2-surface': '#121414',
        'v2-surface-dim': '#121414',
        'v2-surface-bright': '#383939',
        'v2-surface-lowest': '#0d0e0f',
        'v2-surface-low': '#1b1c1c',
        'v2-surface-container': '#1f2020',
        'v2-surface-high': '#292a2a',
        'v2-surface-highest': '#343535',
        'v2-on-surface': '#e3e2e2',
        'v2-on-surface-variant': '#ddc1af',
        'v2-outline': '#a58c7c',
        'v2-primary': '#f27f0d', // Vibrant Orange
        'v2-primary-dim': '#ffb784',
        'v2-on-primary': '#4f2500',
        'v2-success': '#059669', // Dark Emerald Green
        'v2-error': '#ef4444', // Vibrant Red
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Space Grotesk', 'sans-serif'],
        'mono': ['monospace'],
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