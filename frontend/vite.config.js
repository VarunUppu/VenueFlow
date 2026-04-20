import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_URL = process.env.VITE_API_URL || 'http://localhost:8080';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/zones': BACKEND_URL,
      '/gates': BACKEND_URL,
      '/queues': BACKEND_URL,
      '/incidents': BACKEND_URL,
    }
  }
})