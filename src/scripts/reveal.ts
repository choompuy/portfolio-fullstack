export function reveal(selector = '[data-reveal]') {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const observer = new IntersectionObserver(
    (entries) => {
      // Элементы, вошедшие в экран одновременно, появляются по очереди
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, index) => {
          const el = entry.target as HTMLElement
          el.style.setProperty('--d', `${Math.min(index, 5) * 80}ms`)
          el.classList.add('is-in')
          observer.unobserve(el)
        })
    },
    { threshold: 0.2 }
  )

  document.querySelectorAll(selector).forEach((el) => observer.observe(el))
}
