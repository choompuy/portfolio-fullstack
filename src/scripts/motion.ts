import { afterHero } from './ready'

/**
 * Появление элементов при скролле: один раз, когда элемент доходит до экрана.
 * Стили лежат в global.css, раздел "Анимации".
 *
 * Атрибуты:
 *  - data-reveal: небольшой элемент. Схему (emerge или focus) скрипт назначает сам и
 *    чередует по порядку в разметке, чтобы две одинаковые анимации не шли подряд.
 *    Можно задать вручную: data-reveal="focus";
 *  - data-reveal-group: контейнер, дети с data-reveal появляются вместе по очереди, одной схемой;
 *  - data-reveal-words: слова крупного текста. "dissolve" (по умолчанию) вразнобой, "ignite" от центра;
 *  - data-chips: список чипов, они выскакивают по очереди.
 */
const GROUP = '[data-reveal-group]'
const VARIANTS = ['emerge', 'focus']
const STEP = 80 // мс между соседними элементами
const MAX_STAGGER = 5 // у одиночных элементов, вошедших вместе, задержка не растёт дальше этого шага
const WORD_STEP = 45 // мс между словами, как в CSS (.st-word)

export function initMotion() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  assignVariants()
  document.querySelectorAll<HTMLElement>('[data-reveal-words]').forEach(splitWords)
  observe()
}

/** Чередуем схемы по порядку в разметке: группа или одиночный элемент получает следующую */
function assignVariants() {
  let turn = 0
  document
    .querySelectorAll<HTMLElement>(`${GROUP}, [data-reveal]`)
    .forEach((unit) => {
      if (!unit.matches(GROUP) && unit.parentElement?.closest(GROUP)) return
      const variant = VARIANTS[turn++ % VARIANTS.length]
      const targets = unit.matches(GROUP)
        ? unit.querySelectorAll<HTMLElement>(':scope > [data-reveal]')
        : [unit]
      targets.forEach((el) => {
        el.dataset.fx = el.dataset.reveal || variant
      })
    })
}

/** Оборачиваем слова в span, сохраняя вложенные теги и их классы */
function splitWords(root: HTMLElement) {
  const mode = root.dataset.revealWords || 'dissolve'
  const words: HTMLElement[] = []

  const walk = (node: Node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType !== Node.TEXT_NODE) {
        walk(child)
        continue
      }
      const fragment = document.createDocumentFragment()
      for (const part of (child.textContent ?? '').split(/([ \t\n\r]+)/)) {
        if (!part.trim()) {
          fragment.append(part)
          continue
        }
        const word = document.createElement('span')
        word.className = 'st-word'
        word.textContent = part
        words.push(word)
        fragment.append(word)
      }
      child.replaceWith(fragment)
    }
  }
  walk(root)
  order(words.length, mode).forEach((rank, i) => words[i].style.setProperty('--i', String(rank)))
  root.classList.add('is-ready')
}

/** Ранг появления каждого слова: чем меньше, тем раньше */
function order(count: number, mode: string): number[] {
  if (mode === 'ignite') {
    const middle = (count - 1) / 2
    return Array.from({ length: count }, (_, i) => Math.abs(i - middle))
  }
  // Детерминированное перемешивание: порядок не меняется между загрузками
  const ranks = Array.from({ length: count }, (_, i) => i)
  let seed = count * 7919
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 2 ** 32
  }
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[ranks[i], ranks[j]] = [ranks[j], ranks[i]]
  }
  return ranks
}

function show(el: HTMLElement, delay: number) {
  el.style.setProperty('--d', `${delay}ms`)
  el.classList.add('is-in')

  // Отдельные слои для слов нужны только на время анимации
  const words = el.querySelectorAll('.st-word').length
  if (words) {
    el.classList.add('is-hot')
    setTimeout(() => el.classList.remove('is-hot'), words * WORD_STEP + 1300 + delay)
  }
}

/** Чипы первого экрана стартуют сразу, остальное ждёт конца анимации обложки */
const gate = (el: HTMLElement, fn: () => void) =>
  el.hasAttribute('data-chips-priority') ? fn() : afterHero(fn)

function observe() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter(
          // Показан достаточный кусок: 20% элемента или четверть экрана (для высоких блоков)
          (entry) =>
            entry.isIntersecting &&
            (entry.intersectionRatio >= 0.2 || entry.intersectionRect.height >= innerHeight * 0.25)
        )
        .forEach((entry, order) => {
          const el = entry.target as HTMLElement
          observer.unobserve(el)

          gate(el, () => {
            if (el.matches(GROUP)) {
              el.querySelectorAll<HTMLElement>(':scope > [data-reveal]').forEach((child, i) =>
                show(child, i * STEP)
              )
            } else {
              show(el, Math.min(order, MAX_STAGGER) * STEP)
            }
          })
        })
    },
    // Мелкие шаги порога, чтобы поймать момент, когда видна нужная часть высокого блока
    { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
  )

  document
    .querySelectorAll<HTMLElement>(`${GROUP}, [data-reveal], [data-chips], [data-reveal-words]`)
    .forEach((el) => {
      // Дети группы управляются самой группой
      if (!el.matches(GROUP) && el.parentElement?.closest(GROUP)) return
      observer.observe(el)
    })
}
