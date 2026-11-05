export function splitTitle(selector: string) {
  document.querySelectorAll<HTMLElement>(selector).forEach((title) => {
    if (!document.documentElement.classList.contains('anim')) return

    const text = title.textContent ?? ''
    title.setAttribute('aria-label', text)
    title.textContent = ''

    let index = 0
    text.split(' ').forEach((word, wordIndex) => {
      if (wordIndex > 0) title.append(' ')

      const wordEl = document.createElement('span')
      wordEl.className = 'inline-block whitespace-nowrap'
      wordEl.setAttribute('aria-hidden', 'true')

      for (const char of word) {
        const letter = document.createElement('span')
        letter.className = 'lt'
        letter.style.setProperty('--i', String(index++))
        letter.textContent = char
        wordEl.append(letter)
      }
      title.append(wordEl)
    })

    title.classList.add('is-split')
  })
}
