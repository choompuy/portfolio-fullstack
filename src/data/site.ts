import type { NavItem } from '../types'
import { projects } from './projects'

const plural = (n: number, [one, few, many]: [string, string, string]) => {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few
  return many
}

const commercial = projects.filter((p) => p.group === 'commercial').length
const personal = projects.filter((p) => p.group === 'personal').length

export const site = {
  name: 'Васильев Айхал',
  role: 'Fullstack Developer',
  tagline:
    'Делаю интерфейсы на React и Next.js: админки, дашборды, корзины и формы для сервисов доставки',
  status: 'Открыт к предложениям',
  techCard: {
    title: 'Технологии',
    chips: ['React', 'Next.js', 'Vue 3', 'TypeScript', 'Firebase', 'Supabase'],
  },
  about: {
    label: 'Обо мне',
    leadBase: 'Привет, я Айхал.',
    leadAccent: ' Делаю фронтенд на React, Next.js и Vue и сам подключаю его к API.',
    metrics: [
      {
        value: String(commercial),
        caption: plural(commercial, [
          'коммерческий проект',
          'коммерческих проекта',
          'коммерческих проектов',
        ]),
      },
      {
        value: String(personal),
        caption: plural(personal, ['личный проект', 'личных проекта', 'личных проектов']),
      },
      { value: 'React 19', caption: 'и Next.js 16 в рабочем стеке' },
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
