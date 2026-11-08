import { getImage } from 'astro:assets'
import type { Shot } from '../types'

/** Экран iPhone 15 / 16 в логических пикселях: 393 × 852 */
export const IPHONE_RATIO = 393 / 852

/** Полосы экрана iPhone в долях его ширины: сверху статус-бар с Dynamic Island, снизу индикатор */
export const PHONE_BARS = { top: 0.125, bottom: 0.065 }

/** Пропорции области, в которую ложится скриншот телефона (ширина / высота) */
export const PHONE_CONTENT_RATIO = 1 / (1 / IPHONE_RATIO - PHONE_BARS.top - PHONE_BARS.bottom)

export type ResolvedScreen =
  | { kind: 'empty' }
  | { kind: 'plain'; src: string; remote: boolean }
  | {
      kind: 'sheet'
      img: Awaited<ReturnType<typeof getImage>>
      style: string
    }

interface Options {
  sheetWidths?: number[]
  sheetSizes?: string
}

/**
 * Готовит экран устройства.
 * Обычный скриншот кладётся как есть. Склейку из нескольких экранов (sheet) режем без
 * пересохранения файла: считаем, какой кусок показать, и двигаем картинку внутри рамки.
 * Скриншот всегда прижат к верху, лишнее обрезается снизу.
 */
export async function resolveScreen(
  shot: Shot,
  { sheetWidths = [960, 1920], sheetSizes = '44rem' }: Options = {}
): Promise<ResolvedScreen> {
  if (!shot.src) return { kind: 'empty' }
  if (!shot.sheet) return { kind: 'plain', src: shot.src, remote: shot.src.startsWith('http') }

  const { index, panels, gap = 0, pad = 0 } = shot.sheet
  const img = await getImage({
    src: shot.src,
    inferSize: true,
    widths: sheetWidths,
    sizes: sheetSizes,
    format: 'webp',
  })
  const width = Number(img.attributes.width)
  const height = Number(img.attributes.height)

  const panelW = (width - 2 * pad - gap * (panels - 1)) / panels
  const panelRatio = panelW / height

  // панель шире области: вписываем по высоте и обрезаем бока поровну (k > 1)
  const k = Math.max(1, panelRatio / PHONE_CONTENT_RATIO)
  const widthPct = (width / panelW) * k * 100
  const leftPct = (-(k - 1) / 2 - (((pad + index * (panelW + gap)) / panelW) * k)) * 100

  return {
    kind: 'sheet',
    img,
    style: `width:${widthPct.toFixed(3)}%;left:${leftPct.toFixed(3)}%`,
  }
}
