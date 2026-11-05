/** Слова появляются один раз, когда блок доходит до экрана (стили .st-word в global.css). */
export function revealWords(selector: string) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  document.querySelectorAll<HTMLElement>(selector).forEach(init)
}

function init(root: HTMLElement) {
  let count = 0

  // Оборачиваем каждое слово в span, сохраняя вложенные теги и их классы
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
        word.style.setProperty('--i', String(count++))
        word.textContent = part
        fragment.append(word)
      }
      child.replaceWith(fragment)
    }
  }
  walk(root)
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
