import type { NavItem } from '../types'

export const site = {
  name: 'Васильев Айхал',
  initial: 'А',
  role: 'Frontend Developer',
  tagline:
    'Создаю сложные, современные и удобные интерфейсы - с вниманием к архитектуре, производительности и пользовательскому опыту',
  status: 'Открыт к предложениям',
  techCard: {
    title: 'Технологии',
    chips: ['React', 'Next.js', 'Vue 3', 'TypeScript', 'Firebase', 'Supabase'],
  },
  about: {
    label: 'Обо мне',
    leadBase: 'Меня зовут Васильев Айхал - Frontend Developer',
    leadAccent: ', специализирующийся на создании сложных, современных и удобных интерфейсов',
    text: 'Занимаюсь разработкой адаптивных и интерактивных интерфейсов с использованием современных технологий, уделяя особое внимание архитектуре, качеству кода и производительности',
    metrics: [
      { value: '3', caption: 'коммерческих проекта' },
      { value: '4', caption: 'личных проекта' },
      { value: 'React 19', caption: 'и Next.js 16 в рабочем стеке' },
    ],
  },
  skills: {
    titleLines: ['Стек', 'и инструменты'],
    text: 'Полный цикл разработки фронтенда - от архитектуры до деплоя',
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
