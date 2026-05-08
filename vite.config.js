import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Build timestamp for version display
const BUILD_TIME = new Date()
const BUILD_VERSION = `${BUILD_TIME.getHours().toString().padStart(2, '0')}:${BUILD_TIME.getMinutes().toString().padStart(2, '0')}`
const BUILD_ID = BUILD_TIME.getTime().toString()

// Plugin: write version.json to dist after build for client-side update detection
function writeVersionPlugin() {
  return {
    name: 'write-version-json',
    closeBundle() {
      const distDir = path.resolve('dist')
      if (fs.existsSync(distDir)) {
        fs.writeFileSync(
          path.join(distDir, 'version.json'),
          JSON.stringify({ version: BUILD_VERSION, buildId: BUILD_ID })
        )
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), writeVersionPlugin()],
  define: {
    __BUILD_VERSION__: JSON.stringify(BUILD_VERSION),
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
})
