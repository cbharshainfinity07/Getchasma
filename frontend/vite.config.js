import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const API_URL = process.env.VITE_API_PROXY || 'http://localhost:5001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Same-origin API in development so httpOnly session cookies just work.
    proxy: {
      '/api': { target: API_URL, changeOrigin: true },
      '/uploads': { target: API_URL, changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts') || id.includes('d3-')) return 'charts'
          if (id.includes('node_modules/react') || id.includes('react-router')) return 'react'
        },
      },
    },
  },
})
