import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { assertLength, slice, uint32 } from '../utils.js'

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
    return false
  }
  return true
}

export const pngSize: ImageSizeExtractor = (input) => {
  const chunkName = slice(input, 12, 16)
  if (chunkName === pngFriedChunkName) {
    // CgBI 时 width@32/height@36，需要至少 40 字节。
    assertLength(input, 40, 'Invalid PNG')
  } else if (chunkName === 'IHDR') {
    // 正常 IHDR 时 width@16/height@20，需要至少 24 字节。
    assertLength(input, 24, 'Invalid PNG')
  } else {
    throw new TypeError('Invalid PNG')
  }
  const offset = chunkName === pngFriedChunkName ? 32 : 16
  return {
    width: uint32(input, offset),
    height: uint32(input, offset + 4),
  }
}

export const png: ImageSupport = ['png', isPng, pngSize]
