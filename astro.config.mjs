// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

// Inter Variable лежит в src/assets/fonts: только кириллица и латиница, остальные наборы не нужны
const inter = (subset) => `./src/assets/fonts/inter-${subset}-wght-normal.woff2`

// https://astro.build/config
export default defineConfig({
  image: {
    domains: ['raw.githubusercontent.com']
  },
  // Стили одной страницы лежат прямо в HTML: браузеру не нужен отдельный запрос до первой отрисовки
  build: {
    inlineStylesheets: 'always'
  },
  fonts: [
    {
      name: 'Inter',
      cssVariable: '--font-inter',
      provider: fontProviders.local(),
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          {
            src: [inter('cyrillic')],
            weight: '100 900',
            style: 'normal',
            display: 'swap',
            unicodeRange: ['U+0301', 'U+0400-045F', 'U+0490-0491', 'U+04B0-04B1', 'U+2116']
          },
          {
            src: [inter('latin')],
            weight: '100 900',
            style: 'normal',
            display: 'swap',
            unicodeRange: [
              'U+0000-00FF', 'U+0131', 'U+0152-0153', 'U+02BB-02BC', 'U+02C6', 'U+02DA', 'U+02DC',
              'U+0304', 'U+0308', 'U+0329', 'U+2000-206F', 'U+20AC', 'U+2122', 'U+2191', 'U+2193',
              'U+2212', 'U+2215', 'U+FEFF', 'U+FFFD'
            ]
          }
        ]
      }
    }
  ],
  vite: {
    plugins: [tailwindcss()]
  }
})
