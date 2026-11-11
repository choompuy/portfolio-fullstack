import type { NavItem } from '../types'

export const site = {
  name: 'Васильев Айхал',
  role: 'Fullstack Developer',
  tagline:
    'Беру фичу целиком: от схемы БД и API до интерфейса. Делаю админки, дашборды и сервисы доставки',
  status: 'Открыт к предложениям',
  techCard: {
    title: 'Технологии',
    chips: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Supabase'],
  },
  about: {
    label: 'Обо мне',
    leadBase: 'Не только интерфейс.',
    leadAccent: ' Вот что я делаю под ним и где это можно посмотреть.',
    layers: [
      {
        title: 'Данные',
        text: 'PostgreSQL в Supabase: схема на 12 таблиц, 24 RLS-политики, роли admin и superadmin. Аналитику для дашбордов считаю SQL-функциями, а не на клиенте.',
        projects: ['Eda Clone'],
      },
      {
        title: 'API',
        text: 'Серверная логика на Next.js и Express 5: валидация входа на Zod, загрузка изображений, Twitch и YouTube API, живая очередь через SSE.',
        projects: ['Eda Clone', 'StreamQueue'],
      },
      {
        title: 'Интерфейс',
        text: 'React и Next.js: дашборды с таблицами и графиками, формы, корзина и чекаут, вход по телефону с OTP. Состояние на Redux Toolkit, адаптив под телефон.',
        projects: ['Sitim Web', 'Delivery CRM'],
      },
    ],
  },
  skills: {
    titleLines: ['Навыки'],
  },
  contacts: {
    label: 'Контакты',
    email: 'choompuy.contact@gmail.com',
    links: [
      { label: 'Telegram', href: 'https://t.me/choompuy' },
      { label: 'GitHub', href: 'https://github.com/choompuy' },
    ],
  },
}

export const nav: NavItem[] = [
  { label: 'Проекты', href: '#projects' },
  { label: 'Обо мне', href: '#about' },
  { label: 'Навыки', href: '#skills' },
]
