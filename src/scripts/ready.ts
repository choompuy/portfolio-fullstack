/** Время от загрузки страницы (мс), когда заканчивается появление первого экрана */
const HERO_DONE = 1700

/** Остальные блоки не появляются раньше обложки, даже если видны на большом экране сразу */
export function afterHero(fn: () => void) {
  const left = HERO_DONE - performance.now()
  if (left > 0) setTimeout(fn, left)
  else fn()
}
