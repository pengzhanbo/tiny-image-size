import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { assertLength, slice, uint32 } from '../utils.js'

export const isPsd: ImageTypeValidator = (input) => slice(input, 0, 4) === '8BPS'

export const psdSize: ImageSizeExtractor = (input) => {
  assertLength(input, 22, 'Invalid PSD')
  return {
    width: uint32(input, 18),
    height: uint32(input, 14),
  }
}

export const psd: ImageSupport = ['psd', isPsd, psdSize]
