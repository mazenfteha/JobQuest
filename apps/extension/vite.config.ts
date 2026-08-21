import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.config'

// https://crxjs.dev/vite-plugin
export default defineConfig({
  plugins: [crx({ manifest })],
})
