/**
 * Переключает шапку между обложкой и плавающей плашкой.
 * Сторож лежит в самом верху страницы: ушёл с экрана значит страница прокручена.
 * Анимацию выезда включаем только после первого срабатывания, чтобы она не играла при загрузке.
 */
export function siteHeader(headerSelector: string, sentinelSelector: string) {
  const header = document.querySelector<HTMLElement>(headerSelector)
  const sentinel = document.querySelector<HTMLElement>(sentinelSelector)
  if (!header || !sentinel) return

  let initial = true

  new IntersectionObserver(([entry]) => {
    const docked = !entry.isIntersecting
    header.dataset.state = docked ? 'docked' : 'top'
    header.toggleAttribute('data-enter', docked && !initial)
    initial = false
  }).observe(sentinel)
}
