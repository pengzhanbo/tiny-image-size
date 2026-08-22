import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { assertLength, uint16 } from '../utils.js'

export const isTga: ImageTypeValidator = (input) =>
  input.length >= 6 && uint16(input, 0, true) === 0 && uint16(input, 4, true) === 0

export const tgaSize: ImageSizeExtractor = (input) => {
  assertLength(input, 16, 'Invalid TGA')
  return {
    width: uint16(input, 12, true),
    height: uint16(input, 14, true),
  }
}

export const tga: ImageSupport = ['tga', isTga, tgaSize]
