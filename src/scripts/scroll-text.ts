export function scrollText(selector: string) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  document.querySelectorAll<HTMLElement>(selector).forEach(init)
}

function init(root: HTMLElement) {
  const words: HTMLElement[] = []

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
        word.textContent = part
        words.push(word)
        fragment.append(word)
      }
      child.replaceWith(fragment)
    }
  }
  walk(root)

  let frame = 0
  let last = -1

  const update = () => {
    frame = 0
    const rect = root.getBoundingClientRect()
    const height = innerHeight
    // 0 - блок только появился снизу, 1 - блок дошёл до середины экрана
    const start = height * 0.9
    const end = height * 0.5
    const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end + rect.height)))
    if (progress === last) return
    last = progress

    const position = progress * (words.length + 3)
    words.forEach((word, i) => {
      const value = Math.min(1, Math.max(0, position - i - 1))
      word.style.setProperty('--a', value.toFixed(3))
    })
  }

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }

  addEventListener('scroll', schedule, { passive: true })
  addEventListener('resize', schedule)
  update()
}
