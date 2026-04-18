import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/zones': 'http://localhost:8080',
      '/gates': 'http://localhost:8080',
      '/queues': 'http://localhost:8080',
      '/incidents': 'http://localhost:8080',
    }
  }
})
