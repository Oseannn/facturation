import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'ProInvoice Digital',
        short_name: 'ProInvoice',
        description: 'Application de facturation professionnelle pour services digitaux',
        theme_color: '#000000',
        background_color: '#FAFAFA',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2910/2910768.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2910/2910768.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});