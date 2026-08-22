import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { uint16 } from '../utils.js'

export function isIcoLike(input: Uint8Array, type: number): boolean {
  if (input.length < 6) {
    return false
  }
  const reserved = uint16(input, 0, true)
  const count = uint16(input, 4, true)
  if (reserved !== 0 || count === 0) {
    return false
  }
  const imageType = uint16(input, 2, true)
  return imageType === type
}

export const isIco: ImageTypeValidator = (input) => isIcoLike(input, 1)

export const icoSize: ImageSizeExtractor = (input) => ({
  width: input[6] === 0 ? 256 : input[6]!,
  height: input[7] === 0 ? 256 : input[7]!,
})

export const ico: ImageSupport = ['ico', isIco, icoSize]
