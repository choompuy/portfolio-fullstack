import { afterHero } from './ready'

const GROUP = '[data-reveal-group]'
const STEP = 80 // мс между соседними элементами
const MAX_STAGGER = 5 // у одиночных элементов, вошедших вместе, задержка не растёт дальше этого шага

/**
 * Элементы с data-reveal появляются один раз, когда доходят до экрана (стили в global.css).
 * Дети контейнера с data-reveal-group появляются вместе с ним, строго по порядку в разметке.
 */
export function reveal() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const show = (el: HTMLElement, delay: number) => {
    el.style.setProperty('--d', `${delay}ms`)
    el.classList.add('is-in')
  }

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

          afterHero(() => {
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

  document.querySelectorAll<HTMLElement>(`${GROUP}, [data-reveal]`).forEach((el) => {
    // Дети группы управляются самой группой
    if (!el.matches(GROUP) && el.parentElement?.matches(GROUP)) return
    observer.observe(el)
  })
}
