type Rgb = [number, number, number]

const NUM = '(\\d+(?:\\.\\d+)?|\\.\\d+)'
const ALPHA = '(?:\\d+(?:\\.\\d+)?|\\.\\d+)%?'
const RGB_COMMA = new RegExp(`^rgba?\\(\\s*${NUM}\\s*,\\s*${NUM}\\s*,\\s*${NUM}\\s*(?:,\\s*${ALPHA}\\s*)?\\)$`)
const RGB_SPACE = new RegExp(`^rgba?\\(\\s*${NUM}\\s+${NUM}\\s+${NUM}\\s*(?:/\\s*${ALPHA}\\s*)?\\)$`)

function checkChannels(channels: number[], value: string): Rgb {
  if (channels.some((c) => !Number.isFinite(c) || c < 0 || c > 255)) {
    throw new Error(`Invalid color: "${value}"`)
  }
  return [channels[0], channels[1], channels[2]]
}

/** Parses "#rgb", "#rrggbb", "rgb(r, g, b)", "rgba(r, g, b, a)" (alpha ignored) and "rgb(r g b / a)"; throws on anything else. */
export function parseColor(value: string): [number, number, number] {
  const text = value.trim().toLowerCase()

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(text)
  if (hex) {
    const digits = hex[1].length === 3 ? hex[1].replace(/./g, (d) => d + d) : hex[1]
    return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16)) as Rgb
  }

  const match = RGB_COMMA.exec(text) ?? RGB_SPACE.exec(text)
  if (match) return checkChannels([match[1], match[2], match[3]].map(Number), value)

  throw new Error(`Unsupported color: "${value}"`)
}

/** WCAG 2.x relative luminance of an sRGB color (0..1). */
export function relativeLuminance(rgb: readonly [number, number, number]): number {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio (1..21), symmetric. contrastRatio('#000','#fff') === 21; same color → 1. */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(parseColor(foreground))
  const b = relativeLuminance(parseColor(background))
  const [light, dark] = a >= b ? [a, b] : [b, a]
  return (light + 0.05) / (dark + 0.05)
}
