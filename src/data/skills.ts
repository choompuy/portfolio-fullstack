import type { SkillGroup } from '../types'

export const skills: SkillGroup[] = [
  {
    name: 'Дизайн интерфейсов',
    items: ['Design tokens', 'UI-kit', 'Tailwind v4', 'Адаптив', 'Figma'],
  },
  {
    name: 'Архитектура',
    items: ['Схема БД и RLS', 'REST API', 'RBAC', 'Feature-Sliced Design', 'Zod'],
  },
  {
    name: 'Оптимизация',
    items: ['WebP через Sharp', 'SQL RPC', 'Suspense', 'Lazy loading', 'Кэш ответов'],
  },
  {
    name: 'Стек',
    items: ['TypeScript', 'React', 'Next.js', 'Vue 3', 'Node.js', 'Express', 'PostgreSQL', 'Supabase'],
  },
]
