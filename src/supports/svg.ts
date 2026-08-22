import type {
  ImageSupport,
  ImageTypeValidator,
  ImageSizeExtractor,
  ImageSizeResult,
} from '../types.js'
import { slice } from '../utils.js'

interface SVGAttributes {
  width?: number | null
  height?: number | null
  viewBox?: Omit<SVGAttributes, 'viewBox'> | null
}

type ImageSize = Pick<ImageSizeResult, 'width' | 'height'>

const RE_SVG = /<svg\s([^>"']|"[^"]*"|'[^']*')*>/
const RE_SVG_WIDTH = /\swidth=(['"])([^%]+?)\1/
const RE_SVG_HEIGHT = /\sheight=(['"])([^%]+?)\1/
const RE_SVG_VIEW_BOX = /\sviewBox=(['"])(.+?)\1/i

const INCH_CM = 2.54
const units: Record<string, number> = {
  in: 96,
  cm: 96 / INCH_CM,
  em: 16,
  ex: 8,
  m: (96 / INCH_CM) * 100,
  mm: 96 / INCH_CM / 10,
  pc: 96 / 72 / 12,
  pt: 96 / 72,
  px: 1,
}

const RE_UNITS = new RegExp(`^([0-9.]+(?:e\\d+)?)(${Object.keys(units).join('|')})?$`)

function parseLength(len: string): number | undefined {
  const m = RE_UNITS.exec(len)
  if (!m) {
    return undefined
  }
  return Math.round(Number(m[1]) * (units[m[2]!] ?? 1))
}

function parseViewBox(viewBox: string): SVGAttributes {
  // Split on commas or any whitespace, drop empty segments so both
  // `viewBox="0 0 123 456"` and `viewBox="0,0,123,456"` parse correctly.
  // 按逗号或任意空白切分并过滤空段，兼容空格分隔与逗号分隔的 viewBox。
  const parts = viewBox.split(/[\s,]+/).filter(Boolean)
  const [, , width = '', height = ''] = parts
  return {
    width: parseLength(width),
    height: parseLength(height),
  }
}

function parseAttributes(root: string): SVGAttributes {
  const width = root.match(RE_SVG_WIDTH)
  const height = root.match(RE_SVG_HEIGHT)
  const viewBox = root.match(RE_SVG_VIEW_BOX)
  return {
    width: width && parseLength(width[2]!),
    height: height && parseLength(height[2]!),
    viewBox: viewBox && parseViewBox(viewBox[2]!),
  }
}

function getSizeByViewBox(attrs: SVGAttributes, viewBox: SVGAttributes): ImageSize {
  const ratio = (viewBox.width as number) / (viewBox.height as number)
  if (attrs.width) {
    return {
      height: Math.floor(attrs.width / ratio),
      width: attrs.width,
    }
  }
  if (attrs.height) {
    return {
      height: attrs.height,
      width: Math.floor(attrs.height * ratio),
    }
  }
  return {
    height: viewBox.height as number,
    width: viewBox.width as number,
  }
}

export const isSvg: ImageTypeValidator = (input: Uint8Array) => RE_SVG.test(slice(input))

export const svgSize: ImageSizeExtractor = (input: Uint8Array) => {
  const root = slice(input).match(RE_SVG)
  if (root) {
    const attrs = parseAttributes(root[0])
    if (attrs.width && attrs.height) {
      return {
        height: attrs.height,
        width: attrs.width,
      }
    }
    if (attrs.viewBox) {
      return getSizeByViewBox(attrs, attrs.viewBox)
    }
  }
  throw new TypeError('Invalid SVG')
}

export const svg: ImageSupport = ['svg', isSvg, svgSize]
