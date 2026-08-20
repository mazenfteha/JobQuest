import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Dev-only: browser calls same-origin `/api/*`, Vite proxies to the
      // NestJS backend on :3000 (avoids CORS, and `/api` doesn't collide with
      // client routes like /applications). VITE_API_URL=/api (.env.development).
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
