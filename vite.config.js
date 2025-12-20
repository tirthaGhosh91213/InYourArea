import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'copy-onesignal-workers',
      writeBundle() {
        // Copy OneSignal worker files to dist root
        copyFileSync('public/OneSignalSDKWorker.js', 'dist/OneSignalSDKWorker.js')
        copyFileSync('public/OneSignalSDKWorkerUpdater.js', 'dist/OneSignalSDKWorkerUpdater.js')
        console.log('✅ OneSignal worker files copied to dist/')
      }
    }
  ],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
