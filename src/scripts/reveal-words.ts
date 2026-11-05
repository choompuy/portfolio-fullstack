/**
 * Слова появляются один раз, когда блок доходит до экрана (стили .st-word в global.css).
 * Значение data-reveal-words:
 *  - пусто или "dissolve": слова проявляются вразнобой, как растворение по шуму;
 *  - "ignite": от центра к краям;
 *  - "letters": растворение по буквам (для коротких заголовков).
 */
export function revealWords(selector: string) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  document.querySelectorAll<HTMLElement>(selector).forEach(init)
}

function init(root: HTMLElement) {
  const mode = root.dataset.revealWords || 'dissolve'
  const units: HTMLElement[] = []

  const unit = (text: string) => {
    const el = document.createElement('span')
    el.className = 'st-word'
    el.textContent = text
    units.push(el)
    return el
  }

  // Оборачиваем слова (или буквы) в span, сохраняя вложенные теги и их классы
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
        if (mode === 'letters') {
          const word = document.createElement('span')
          word.className = 'inline-block whitespace-nowrap'
          word.setAttribute('aria-hidden', 'true')
          for (const char of part) word.append(unit(char))
          fragment.append(word)
        } else {
          fragment.append(unit(part))
        }
      }
      child.replaceWith(fragment)
    }
  }

  if (mode === 'letters') root.setAttribute('aria-label', root.textContent ?? '')
  walk(root)
  order(units.length, mode).forEach((rank, i) => units[i].style.setProperty('--i', String(rank)))
  root.classList.add('is-ready')

  // Запускаем один раз, когда верх блока поднялся выше 80% высоты экрана
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      root.classList.add('is-in')
      observer.disconnect()
    },
    { rootMargin: '0px 0px -20% 0px' }
  )
  observer.observe(root)
}

/** Ранг появления каждого элемента: чем меньше, тем раньше */
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
