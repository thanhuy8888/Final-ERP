import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  server: {
    proxy: {
      '/uploads': {
        target: 'http://localhost:80/Final-ERP',
        changeOrigin: true,
      },
    },
  },
})
