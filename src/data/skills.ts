import type { SkillGroup } from '../types'

export const skills: SkillGroup[] = [
  {
    name: 'Frontend',
    items: ['React 19', 'Next.js', 'Vue 3', 'TypeScript', 'Tailwind CSS', 'React Native'],
  },
  {
    name: 'Состояние и формы',
    items: ['Redux Toolkit', 'RTK Query', 'Zustand', 'React Hook Form', 'Zod'],
  },
  {
    name: 'Таблицы и графики',
    items: ['TanStack Table', 'Recharts', 'Chart.js', 'shadcn/ui', 'PrimeVue'],
  },
  {
    name: 'Данные и backend',
    items: ['Supabase', 'Firebase', 'REST API', 'Express', 'SSE'],
  },
]
