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
  intro?: {
    title: string
    lead: string
    text: string
  }
}

export interface SkillGroup {
  name: string
  items: string[]
}
