import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Auth (Workstream B) moved the frontend to call the backend directly
// (VITE_API_URL=http://localhost:3000) with CORS + credentials, so the old
// `/api` dev proxy is gone.
export default defineConfig({
  plugins: [react()],
})
