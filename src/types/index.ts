export interface NavItem {
  label: string
  href: string
}

/** Один экран устройства: https-ссылка на картинку или путь из public/ */
export interface Shot {
  src?: string
  /** Если картинка склеена из нескольких экранов подряд: какой взять и сколько их всего */
  sheet?: { index: number; panels: number; gap?: number }
  /** Цвета полос над и под скриншотом в iPhone: берут из верхней и нижней кромки картинки */
  bar?: { top?: string; bottom?: string }
}

export interface Devices {
  mac?: Shot
  phones?: Shot[]
}

export interface Project {
  title: string
  description: string
  stack: string[]
  year: string
  note?: string
  hue: string
  group: 'commercial' | 'personal'
  layout: 'wide' | 'half' | 'third'
  /** Ссылка на репозиторий */
  href?: string
  /** Ссылка на живое демо */
  demo?: string
  /** Что показывать в рамках устройств. Пустой объект {} рисует устройство с пустым экраном */
  devices: Devices
  intro?: {
    title: string
    lead: string
  }
}

export interface SkillGroup {
  name: string
  items: string[]
}
