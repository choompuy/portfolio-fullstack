/**
 * WebGL-градиент для блоков .glow[data-gradient] (оттенок берётся из --hue).
 * Шейдер считает плавающие цветовые точки с жидким искажением. Лёгкий режим:
 * половинное разрешение, не больше 30 кадров в секунду, один общий цикл на все блоки,
 * рисуются только видимые блоки, на скрытой вкладке пауза.
 * Появление считает сам шейдер: "dissolve" (растворение по шуму) или "ignite" (разгорание из центра).
 */
type Rgb = [number, number, number]

interface Gradient {
  host: HTMLElement
  draw: () => void
  t: number
  rev: number
  revMode: number
  start: number | null
  revealed: boolean
  dirty: boolean
}

const PAGE: Rgb = [0.067, 0.067, 0.067]
const SCALE = 0.5 // разрешение канваса относительно CSS-пикселей
const MAX_WIDTH = 720
const FRAME = 1000 / 30
const DURATION = 1900

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
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+7.1;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;float as=uRes.x/uRes.y;vec2 p=(uv-.5)*vec2(as,1.);float t=uT;
  vec2 w=vec2(fbm(p*1.5+vec2(0.,t*.12)),fbm(p*1.5+vec2(4.,-t*.1)));
  p+=(w-.5)*mix(.32,1.1,uMode);
  vec3 col=vec3(0.);
  for(int i=0;i<4;i++){float fi=float(i);
    vec2 c=vec2(sin(t*.23+fi*1.9)*.38*as,cos(t*.17+fi*2.7)*.34);
    float d=length(p-c);col+=uC[i]*exp(-d*d*mix(7.,3.4,uMode));}
  col=1.-exp(-col*.85);
  vec3 c=uBg+col*.8;
  float m=1.;float nz=fbm(uv*vec2(as,1.)*2.5+3.);
  if(uRM>1.5){float d=length((uv-vec2(.5,.45))*vec2(as,1.))+(nz-.5)*.28;float e=uRev*1.4-.2;m=1.-smoothstep(e-.3,e,d);}
  else if(uRM>.5){m=smoothstep(nz-.15,nz+.15,uRev*1.4-.2);}
  gl_FragColor=vec4(mix(uBg,c,m),1.);
}`

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const live = new Set<Gradient>()
const gradients = new WeakMap<Element, Gradient>()
const probe = document.createElement('canvas').getContext('2d')

/** Любой CSS-цвет (hex, rgb, color-mix) в числа 0..1 */
function toRgb(css: string): Rgb {
  if (!probe) return [0.35, 0.48, 0.51]
  probe.fillStyle = '#587b82'
  probe.fillStyle = css
  const hex = probe.fillStyle
  if (!hex.startsWith('#')) return [0.35, 0.48, 0.51]
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as Rgb
}

const mix = (a: Rgb, b: Rgb, t: number) => a.map((v, i) => v + (b[i] - v) * t) as Rgb

/** Четыре цвета градиента из одного оттенка: светлее, светлее ещё, темнее, чуть светлее */
function palette(hue: Rgb): Rgb[] {
  const white: Rgb = [1, 1, 1]
  const black: Rgb = [0, 0, 0]
  return [mix(hue, white, 0.15), mix(hue, white, 0.5), mix(hue, black, 0.35), mix(hue, white, 0.3)]
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
  const mode = Number(host.dataset.gradientMode ?? 0)
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
    revMode,
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
    g.dirty = true
  }
  new ResizeObserver(resize).observe(host)
  resize()

  host.prepend(canvas)
  host.classList.add('is-gl')
  return g
}

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
      g.rev = 1 - (1 - p) ** 3
      if (p >= 1) g.start = null
      g.dirty = true
    }
    if (!reduce) {
      g.t += step
      g.dirty = true
    }
    if (g.dirty) g.draw()
  })
}

export function initGradients(selector = '[data-gradient]') {
  const hosts = document.querySelectorAll<HTMLElement>(selector)
  if (!hosts.length) return
  makeGrain()

  // Рисуем блок, пока он на экране (с небольшим запасом)
  const liveObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const g = gradients.get(entry.target)
        if (!g) continue
        if (entry.isIntersecting) {
          live.add(g)
          g.dirty = true
        } else {
          live.delete(g)
        }
      }
    },
    { rootMargin: '150px' }
  )

  // Запускаем появление один раз, когда блок виден хотя бы на четверть
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const g = gradients.get(entry.target)
        if (!g || !entry.isIntersecting || g.revealed) continue
        g.revealed = true
        revealObserver.unobserve(entry.target)
        if (reduce) continue
        // Подстраиваемся под задержку карточки, чтобы градиент и карточка появлялись вместе
        setTimeout(() => {
          const card = g.host.closest<HTMLElement>('[data-reveal]')
          const delay = card ? parseFloat(card.style.getPropertyValue('--d')) || 0 : 0
          g.start = performance.now() + 150 + delay
        }, 100)
      }
    },
    { threshold: 0.25 }
  )

  hosts.forEach((host) => {
    let g: Gradient | null = null
    try {
      g = create(host)
    } catch {
      g = null
    }
    if (!g) {
      host.classList.add('glow--fallback')
      return
    }
    gradients.set(host, g)
    liveObserver.observe(host)
    revealObserver.observe(host)
  })

  requestAnimationFrame(loop)
}
