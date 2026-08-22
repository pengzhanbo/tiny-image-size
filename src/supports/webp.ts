import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { int16, uint24LE, slice, sliceHex } from '../utils.js'

export const isWebp: ImageTypeValidator = (input: Uint8Array) =>
  slice(input, 0, 4) === 'RIFF' && slice(input, 8, 12) === 'WEBP' && slice(input, 12, 15) === 'VP8'

export const webpSize: ImageSizeExtractor = (input: Uint8Array) => {
  const chunk = slice(input, 12, 16)
  input = input.slice(20, 30)
  if (chunk === 'VP8X') {
    const extendedHeader = input[0]!
    const validStart = (extendedHeader & 0xc0) === 0
    const validEnd = (extendedHeader & 0x01) === 0
    if (validStart && validEnd) {
      return {
        width: 1 + uint24LE(input, 4),
        height: 1 + uint24LE(input, 7),
      }
    }
    throw new TypeError('Invalid WebP')
  }

  if (chunk === 'VP8 ' && input[0] !== 0x2f) {
    return {
      width: int16(input, 6, true) & 0x3fff,
      height: int16(input, 8, true) & 0x3fff,
    }
  }

  const hex = sliceHex(input, 3, 6)
  if (chunk === 'VP8L' && hex !== '9d012a') {
    return {
      width: 1 + (((input[2]! & 0x3f) << 8) | input[1]!),
      height: 1 + (((input[4]! & 0xf) << 10) | (input[3]! << 2) | ((input[2]! & 0xc0) >> 6)),
    }
  }

  throw new TypeError('Invalid WebP')
}

export const webp: ImageSupport = ['webp', isWebp, webpSize]
