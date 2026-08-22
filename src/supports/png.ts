import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { slice, uint32 } from '../utils.js'

const pngFriedChunkName = 'CgBI'

export const isPng: ImageTypeValidator = (input) => {
  if (slice(input, 1, 8) !== 'PNG\r\n\x1A\n') {
    return false
  }
  let chunkName = slice(input, 12, 16)
  if (chunkName === pngFriedChunkName) {
    chunkName = slice(input, 28, 32)
  }
  if (chunkName !== 'IHDR') {
    throw new TypeError('Invalid PNG')
  }
  return true
}

export const pngSize: ImageSizeExtractor = (input) => {
  const offset = slice(input, 12, 16) === pngFriedChunkName ? 32 : 16
  return {
    width: uint32(input, offset),
    height: uint32(input, offset + 4),
  }
}

export const png: ImageSupport = ['png', isPng, pngSize]
