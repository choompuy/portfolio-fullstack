/**
 * Переключает шапку между обложкой и плавающей плашкой.
 * Сторож лежит в самом верху страницы: ушёл с экрана значит страница прокручена.
 * Сам переход делает CSS. Он включается через data-ready чуть позже загрузки, чтобы шапка
 * не анимировалась, когда браузер восстанавливает прокрутку после перезагрузки.
 */
const READY_DELAY_MS = 300

export function siteHeader(headerSelector: string, sentinelSelector: string) {
  const header = document.querySelector<HTMLElement>(headerSelector)
  const sentinel = document.querySelector<HTMLElement>(sentinelSelector)
  if (!header || !sentinel) return

  new IntersectionObserver(([entry]) => {
    header.dataset.state = entry.isIntersecting ? 'top' : 'docked'
  }).observe(sentinel)

  const enableTransitions = () =>
    setTimeout(() => header.setAttribute('data-ready', ''), READY_DELAY_MS)

  if (document.readyState === 'complete') enableTransitions()
  else window.addEventListener('load', enableTransitions, { once: true })
}
