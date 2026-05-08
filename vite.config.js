import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build timestamp for version display
const BUILD_TIME = new Date()
const BUILD_VERSION = `${BUILD_TIME.getHours().toString().padStart(2, '0')}:${BUILD_TIME.getMinutes().toString().padStart(2, '0')}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_VERSION__: JSON.stringify(BUILD_VERSION),
  },
})
