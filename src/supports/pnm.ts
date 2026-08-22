import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { slice, hasOwn } from '../utils.js'

const PNMTypes = {
  P1: 'pbm/ascii',
  P2: 'pgm/ascii',
  P3: 'ppm/ascii',
  P4: 'pbm',
  P5: 'pgm',
  P6: 'ppm',
  P7: 'pam',
  PF: 'pfm',
} as const

export const isPnm: ImageTypeValidator = (input) => hasOwn(PNMTypes, slice(input, 0, 2))

export const pnmSize: ImageSizeExtractor = (input) => {
  const type = slice(input, 0, 2) as keyof typeof PNMTypes
  const pnmType = PNMTypes[type]
  const lines = slice(input, 3).split(/[\r\n]+/)
  if (pnmType === 'pam') {
    const size: Record<string, number> = {}
    while (lines.length > 0) {
      const line = lines.shift() as string
      if (line.length > 16 || line.charCodeAt(0) > 128) {
        continue
      }
      const [key, value] = line.split(' ')
      if (key && value) {
        const k = key.toLowerCase()
        if (k === 'width' || k === 'height') {
          const parsed = Number.parseInt(value, 10)
          if (!Number.isFinite(parsed) || parsed < 0) {
            throw new TypeError('Invalid PNM')
          }
          size[k] = parsed
        }
      }
      if (size.height && size.width) {
        return { width: size.width, height: size.height }
      }
    }
  } else {
    let dimensions: string[] = []

    while (lines.length > 0) {
      const line = lines.shift() as string
      if (line[0] === '#') {
        continue
      }
      dimensions = line.split(' ')
      break
    }
    if (dimensions.length === 2) {
      const width = Number.parseInt(dimensions[0]!, 10)
      const height = Number.parseInt(dimensions[1]!, 10)
      if (!Number.isFinite(width) || width < 0 || !Number.isFinite(height) || height < 0) {
        throw new TypeError('Invalid PNM')
      }
      return { width, height }
    }
  }
  throw new TypeError('Invalid PNM')
}

export const pnm: ImageSupport = ['pnm', isPnm, pnmSize]
