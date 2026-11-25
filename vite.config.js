import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'IELTS.RASUL — Band 7.0–8.0 Prep',
        short_name: 'IELTS.RASUL',
        description: '4-week Beast Mode IELTS Academic tracker, Writing Builder, Exam Timers & Media Hub',
        theme_color: '#0b0b0d',
        background_color: '#0b0b0d',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/'
      }
    })
  ]
});
