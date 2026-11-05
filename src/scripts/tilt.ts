export function tilt(selector: string) {
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!canHover || reduce) return

  document.querySelectorAll<HTMLElement>(selector).forEach((card) => {
    let frame = 0

    card.addEventListener('pointermove', (event) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height
        card.style.setProperty('--x', String(x - 0.5))
        card.style.setProperty('--y', String(y - 0.5))
        card.style.setProperty('--mx', `${x * 100}%`)
        card.style.setProperty('--my', `${y * 100}%`)
        card.classList.add('is-active')
      })
    })

    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame)
      card.classList.remove('is-active')
      card.style.setProperty('--x', '0')
      card.style.setProperty('--y', '0')
    })
  })
}
