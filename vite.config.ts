import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'MediCare — Your Personal Medical Dashboard',
        short_name: 'MediCare',
        description: 'AI-powered medical dashboard for uploading prescriptions, comparing medicines, and personalized schedules.',
        theme_color: '#004c8f',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.png', // Assuming favicon.png serves as the base structure
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/favicon.png', // Or another 512x512 icon
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
