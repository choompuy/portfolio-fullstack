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
    'Беру фичу целиком: от схемы БД и API до интерфейса. Делаю админки, дашборды и сервисы доставки',
  status: 'Открыт к предложениям',
  techCard: {
    title: 'Технологии',
    chips: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Supabase'],
  },
  about: {
    label: 'Обо мне',
    leadBase: 'Привет, я Айхал.',
    leadAccent: ' Проектирую базу и API и делаю интерфейс на React и Next.js.',
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
      { value: '24', caption: 'RLS-политики в схеме на 12 таблиц' },
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
