import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { uint16, sliceHex } from '../utils.js'

export const isJpg: ImageTypeValidator = (input) => sliceHex(input, 0, 2) === 'ffd8'

export const jpgSize: ImageSizeExtractor = (input) => {
  input = input.slice(4)
  while (input.length) {
    const i = uint16(input)

    if (i > input.length) {
      throw new TypeError('Corrupt JPG, exceeded buffer limits')
    }

    if (input[i] !== 0xff) {
      input = input.slice(1)
      continue
    }
    const next = input[i + 1]
    if (next === 0xc0 || next === 0xc1 || next === 0xc2) {
      return {
        width: uint16(input, i + 7),
        height: uint16(input, i + 5),
      }
    }
    input = input.slice(i + 2)
  }
  throw new TypeError('Invalid JPG, no size found')
}

export const jpg: ImageSupport = ['jpg', isJpg, jpgSize]
