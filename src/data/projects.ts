import type { Project } from '../types'

const shot = (repo: string, branch: string, file: string) =>
  `https://raw.githubusercontent.com/choompuy/${repo}/${branch}/docs/screenshots/${file}`

/** Четыре экрана приложения, склеенные в одну картинку */
const attractions = shot('reactnative-attractionsguide', 'master', 'hero.png')

export const projects: Project[] = [
  {
    title: 'Eda Clone',
    description:
      'Админ-панель, API и схема PostgreSQL для сервиса доставки еды: роли и RLS, дашборды на SQL-функциях, модификаторы товаров, загрузка изображений.',
    stack: ['Next.js', 'Supabase', 'PostgreSQL', 'TypeScript', 'Recharts'],
    year: '2026',
    hue: '#8a5a4a',
    devices: { mac: {} },
    group: 'commercial',
    layout: 'wide',
    intro: {
      title: 'Eda Clone',
      lead: 'Схема БД, API и админка для доставки еды',
    },
  },
  {
    title: 'Sitim Web',
    description:
      'Frontend с входом по телефону: OTP, hCaptcha, сессии на Redux Toolkit и UI-компоненты на Tailwind v4.',
    stack: ['Next.js', 'TypeScript', 'Redux Toolkit', 'Tailwind v4', 'hCaptcha'],
    year: '2026',
    hue: '#5d6190',
    devices: { phones: [{}, {}] },
    group: 'commercial',
    layout: 'half',
  },
  {
    title: 'Delivery CRM',
    description:
      'Frontend CRM-системы доставки на React и Inertia: корзина, чекаут и конфигуратор товаров с мобильной адаптацией.',
    stack: ['React', 'TypeScript', 'Inertia.js', 'Laravel', 'Tailwind'],
    year: '2026',
    hue: '#85703c',
    devices: { mac: {}, phones: [{}] },
    group: 'commercial',
    layout: 'half',
  },
  {
    title: 'StreamQueue',
    description:
      'Node.js сервис на Express 5: заказ треков за баллы канала Twitch, поиск и проверка на YouTube, живая очередь в панели через SSE и оверлей для OBS.',
    stack: ['Node.js', 'TypeScript', 'Express', 'SSE', 'Twitch API'],
    year: '2026',
    hue: '#6e5b9a',
    devices: {
      mac: { src: shot('stream-queue', 'main', 'main.png') },
      phones: [
        {
          src: shot('stream-queue', 'main', 'mobile.png'),
          sheet: { index: 0, panels: 3, gap: 17, pad: 8 },
          bar: { top: '#15191b', bottom: '#23272a' },
        },
      ],
    },
    group: 'personal',
    layout: 'wide',
    href: 'https://github.com/choompuy/stream-queue',
    intro: {
      title: 'StreamQueue',
      lead: 'Очередь песен для Twitch-стримов',
    },
  },
  {
    title: 'Weather Dashboard',
    description:
      'Погодный и экологический дашборд с расчётом AQI по EPA-логике и интерактивными графиками прогноза.',
    stack: ['Vue 3', 'TypeScript', 'Chart.js', 'PrimeVue'],
    year: '2025',
    hue: '#4a7d9a',
    group: 'personal',
    layout: 'third',
    href: 'https://github.com/choompuy/vue-weather',
    devices: {
      mac: { src: shot('vue-weather', 'main', 'dark.png') },
      phones: [
        {
          src: shot('vue-weather', 'main', 'mobile.png'),
          bar: { top: '#2b2c30', bottom: '#2e3239' },
        },
      ],
    },
  },
  {
    title: 'ProjectPaper',
    description:
      'SaaS для управления проектами с real-time синхронизацией, системой ролей RBAC и двумя видами задач - Board/Table.',
    stack: ['Next.js', 'TypeScript', 'Firebase', 'Redux'],
    year: '2024',
    hue: '#66727f',
    group: 'personal',
    layout: 'third',
    href: 'https://github.com/choompuy/nextjs-projectpaper',
    devices: {
      mac: { src: shot('nextjs-projectpaper', 'master', 'tasks-board.png') },
      phones: [
        {
          src: shot('nextjs-projectpaper', 'master', 'mobile.png'),
          sheet: { index: 1, panels: 3, gap: 10 },
          bar: { top: '#f6f6f6', bottom: '#f3f3f3' },
        },
      ],
    },
  },
  {
    title: 'Attractions Guide',
    description:
      'Мобильный гид по достопримечательностям: каталог с фильтрами, карта с кастомными маркерами, маршруты через Google Directions.',
    stack: ['React Native', 'Expo', 'Firebase', 'Google Maps'],
    year: '2025',
    hue: '#6f7d44',
    group: 'personal',
    layout: 'third',
    href: 'https://github.com/choompuy/reactnative-attractionsguide',
    devices: {
      phones: [
        {
          src: attractions,
          sheet: { index: 0, panels: 4 },
          bar: { top: '#fefcf4', bottom: '#fefcf4' },
        },
        {
          src: attractions,
          sheet: { index: 2, panels: 4 },
          bar: { top: '#fefcf4', bottom: '#fefcf4' },
        },
        {
          src: attractions,
          sheet: { index: 1, panels: 4 },
          bar: { top: '#efeff0', bottom: '#eaecda' },
        },
      ],
    },
  },
]
