import { afterHero } from './ready'

/**
 * WebGL-градиент для блоков .glow[data-gradient] (оттенок берётся из --hue).
 * Два стиля: mesh (мягкие пятна) и aurora (спокойное облако на весь блок).
 * Лёгкий режим: половинное разрешение, не больше 30 кадров в секунду, один общий цикл,
 * рисуются только видимые блоки, контекст создаётся при приближении блока к экрану,
 * на скрытой вкладке пауза. Появление считает сам шейдер: "dissolve" (растворение по шуму)
 * или "ignite" (разгорание из центра до самых краёв).
 */
type Rgb = [number, number, number]

interface Gradient {
  host: HTMLElement
  draw: () => void
  t: number
  rev: number
  start: number | null
  revealed: boolean
  dirty: boolean
}

const PAGE: Rgb = [0.067, 0.067, 0.067]
const SCALE = 0.5 // разрешение канваса относительно CSS-пикселей
const MAX_WIDTH = 720
const FRAME = 1000 / 30
const SPEED = 0.35 // скорость движения градиента: чем меньше, тем спокойнее
const DURATION = 2400 // длительность появления, мс

const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;uniform float uT,uMode,uRev,uRM;uniform vec3 uBg,uC[4];
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n(p);p=p*2.03+7.1;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;float as=uRes.x/uRes.y;vec2 p=(uv-.5)*vec2(as,1.);float t=uT;
  vec3 c=uBg;
  if(uMode>.5){
    // aurora: облако на весь блок, без отдельных кругов
    vec2 q=vec2(fbm(p*.7+vec2(0.,t*.1)),fbm(p*.7+vec2(5.2,-t*.08)));
    float f=fbm(p*.8+1.1*q+vec2(t*.03,0.));
    c+=uC[2]*.42*smoothstep(.1,.7,f);
    c+=uC[0]*.26*smoothstep(.3,.85,f);
    c+=uC[1]*.14*smoothstep(.5,1.,f);
  }else{
    // mesh: три мягких пятна
    vec2 w=vec2(fbm(p*1.5+vec2(0.,t*.12)),fbm(p*1.5+vec2(4.,-t*.1)));
    p+=(w-.5)*.2;
    vec3 col=vec3(0.);
    for(int i=0;i<3;i++){float fi=float(i);
      vec2 b=vec2(sin(t*.23+fi*2.1)*.36*as,cos(t*.17+fi*2.7)*.3);
      float d=length(p-b);col+=uC[i]*exp(-d*d*8.);}
    c+=(1.-exp(-col*.7))*.5;
  }
  // появление: маска доходит до всех краёв, когда uRev = 1
  float m=1.;float nz=fbm(uv*vec2(as,1.)*1.8+3.);
  if(uRM>1.5){float d=length((uv-.5)*2.)/1.4142+(nz-.5)*.35;float e=uRev*2.5-.5;m=1.-smoothstep(e-.6,e,d);}
  else if(uRM>.5){m=smoothstep(nz-.25,nz+.25,uRev*1.5-.25);}
  gl_FragColor=vec4(mix(uBg,c,m),1.);
}`

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const live = new Set<Gradient>()
const gradients = new WeakMap<Element, Gradient>()
const failed = new WeakSet<Element>()
const probe = document.createElement('canvas').getContext('2d')

/** Любой CSS-цвет (hex, rgb, color-mix) в числа 0..1 */
function toRgb(css: string): Rgb {
  const fallback: Rgb = [0.35, 0.48, 0.51]
  if (!probe) return fallback
  probe.fillStyle = '#587b82'
  probe.fillStyle = css
  const hex = probe.fillStyle
  if (!hex.startsWith('#')) return fallback
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as Rgb
}

const mix = (a: Rgb, b: Rgb, t: number) => a.map((v, i) => v + (b[i] - v) * t) as Rgb

/** Четыре цвета градиента из одного оттенка. Светлые доли небольшие, чтобы не слепило */
function palette(hue: Rgb): Rgb[] {
  const white: Rgb = [1, 1, 1]
  const black: Rgb = [0, 0, 0]
  return [mix(hue, white, 0.1), mix(hue, white, 0.35), mix(hue, black, 0.4), mix(hue, white, 0.2)]
}

/** Плитка шума создаётся один раз, дальше это обычная картинка (--grain в CSS) */
function makeGrain() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const image = ctx.createImageData(256, 256)
  for (let i = 0; i < image.data.length; i += 4) {
    image.data[i] = image.data[i + 1] = image.data[i + 2] = 255
    image.data[i + 3] = Math.random() ** 2 * 255
  }
  ctx.putImageData(image, 0, 0)
  document.documentElement.style.setProperty('--grain', `url(${canvas.toDataURL()})`)
}

function create(host: HTMLElement): Gradient | null {
  const canvas = document.createElement('canvas')
  canvas.className = 'glow__canvas'
  canvas.setAttribute('aria-hidden', 'true')
  const gl = canvas.getContext('webgl', {
    antialias: false,
    alpha: false,
    powerPreference: 'low-power',
  })
  if (!gl) return null

  const shader = (type: number, source: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, source)
    gl.compileShader(s)
    return s
  }
  const program = gl.createProgram()!
  gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT))
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'a')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const uniform = (name: string) => gl.getUniformLocation(program, name)
  const u = {
    res: uniform('uRes'),
    t: uniform('uT'),
    mode: uniform('uMode'),
    rev: uniform('uRev'),
    revMode: uniform('uRM'),
    bg: uniform('uBg'),
    colors: uniform('uC[0]'),
  }

  const hue = toRgb(getComputedStyle(host).getPropertyValue('--hue').trim())
  const colors = new Float32Array(palette(hue).flat())
  const mode = host.dataset.gradientStyle === 'aurora' ? 1 : 0
  const revMode = host.dataset.gradient === 'ignite' ? 2 : 1

  const g: Gradient = {
    host,
    draw: () => {
      gl.uniform2f(u.res, canvas.width, canvas.height)
      gl.uniform1f(u.t, g.t)
      gl.uniform1f(u.mode, mode)
      gl.uniform1f(u.rev, g.rev)
      gl.uniform1f(u.revMode, revMode)
      gl.uniform3fv(u.bg, PAGE)
      gl.uniform3fv(u.colors, colors)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      g.dirty = false
    },
    t: Math.random() * 40,
    rev: reduce ? 1 : 0,
    start: null,
    revealed: false,
    dirty: true,
  }

  const resize = () => {
    const width = Math.min(host.clientWidth * SCALE, MAX_WIDTH)
    const ratio = host.clientHeight / Math.max(host.clientWidth, 1)
    canvas.width = Math.max(2, Math.round(width))
    canvas.height = Math.max(2, Math.round(width * ratio))
    gl.viewport(0, 0, canvas.width, canvas.height)
    g.draw()
  }
  new ResizeObserver(resize).observe(host)
  resize()

  // Зерно привязано к появлению градиента: пока он не начался, зерна нет (--rev: 0..1)
  host.style.setProperty('--rev', reduce ? '1' : '0')
  host.prepend(canvas)
  host.classList.add('is-gl')
  return g
}

/** Контекст создаётся один раз, когда блок подошёл к экрану. Без WebGL остаётся CSS-свечение */
function ensure(host: HTMLElement): Gradient | null {
  const existing = gradients.get(host)
  if (existing) return existing
  if (failed.has(host)) return null

  let g: Gradient | null = null
  try {
    g = create(host)
  } catch {
    g = null
  }
  if (!g) {
    failed.add(host)
    host.classList.add('glow--fallback')
    return null
  }
  gradients.set(host, g)
  return g
}

const easeOut = (p: number) => 1 - (1 - p) ** 3

let last = performance.now()
let acc = 0

function loop(now: number) {
  requestAnimationFrame(loop)
  acc += now - last
  last = now
  if (document.hidden || acc < FRAME - 2) return
  const step = acc / 1000
  acc = 0

  live.forEach((g) => {
    if (g.start !== null && now >= g.start) {
      const p = Math.min(1, (now - g.start) / DURATION)
      g.rev = easeOut(p)
      g.host.style.setProperty('--rev', g.rev.toFixed(3))
      if (p >= 1) g.start = null
      g.dirty = true
    }
    if (!reduce) {
      g.t += step * SPEED
      g.dirty = true
    }
    if (g.dirty) g.draw()
  })
}

export function initGradients(selector = '[data-gradient]') {
  const hosts = document.querySelectorAll<HTMLElement>(selector)
  if (!hosts.length) return
  makeGrain()

  // Рисуем блок, пока он на экране (с запасом), и создаём контекст заранее
  const liveObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const host = entry.target as HTMLElement
        if (entry.isIntersecting) {
          const g = ensure(host)
          if (g) {
            live.add(g)
            g.dirty = true
          }
        } else {
          const g = gradients.get(host)
          if (g) live.delete(g)
        }
      }
    },
    { rootMargin: '300px' }
  )

  // Запускаем появление один раз, когда блок виден хотя бы на четверть
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const host = entry.target as HTMLElement
        if (!entry.isIntersecting) continue
        const g = ensure(host)
        if (!g || g.revealed) continue
        g.revealed = true
        revealObserver.unobserve(host)
        if (reduce) continue

        const begin = () => {
          // Подстраиваемся под задержку карточки, чтобы градиент и карточка появлялись вместе
          const card = host.closest<HTMLElement>('[data-reveal]')
          const delay = card ? parseFloat(card.style.getPropertyValue('--d')) || 0 : 0
          g.start = performance.now() + delay
        }
        if (host.hasAttribute('data-gradient-priority')) begin()
        else afterHero(() => setTimeout(begin, 100))
      }
    },
    { threshold: 0.25 }
  )

  hosts.forEach((host) => {
    // Обложка стартует сразу, не дожидаясь наблюдателей
    if (host.hasAttribute('data-gradient-priority')) {
      const g = ensure(host)
      if (g) {
        g.revealed = true
        live.add(g)
        if (!reduce) g.start = performance.now()
      }
    }
    liveObserver.observe(host)
    revealObserver.observe(host)
  })

  requestAnimationFrame(loop)
}
