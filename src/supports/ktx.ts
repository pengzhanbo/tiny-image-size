import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { assertLength, slice, uint32 } from '../utils.js'

export const isKtx: ImageTypeValidator = (input) => {
  const str = slice(input, 1, 7)
  return str === 'KTX 11' || str === 'KTX 20'
}

export const ktxSize: ImageSizeExtractor = (input) => {
  const type = input[5] === 0x31 ? 'ktx' : 'ktx2'
  const offset = type === 'ktx' ? 36 : 20
  if (type === 'ktx') {
    assertLength(input, 44, 'Invalid KTX')
  } else {
    assertLength(input, 28, 'Invalid KTX')
  }
  return {
    width: uint32(input, offset, true),
    height: uint32(input, offset + 4, true),
  }
}

export const ktx: ImageSupport = ['ktx', isKtx, ktxSize]
