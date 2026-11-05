export interface NavItem {
  label: string
  href: string
}

export interface Project {
  slug: string
  title: string
  description: string
  stack: string[]
  year: string
  note?: string
  hue: string
  group: 'commercial' | 'personal'
  layout: 'wide' | 'half' | 'third'
  href?: string
  image?: string
  intro?: {
    title: string
    lead: string
  }
}

export interface SkillGroup {
  name: string
  items: string[]
}
