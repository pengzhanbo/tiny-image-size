import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { uint16, slice } from '../utils.js'

export const isGif: ImageTypeValidator = (input) => {
  const str = slice(input, 0, 6)
  return str === 'GIF89a' || str === 'GIF87a'
}

export const gifSize: ImageSizeExtractor = (input) => ({
  width: uint16(input, 6, true),
  height: uint16(input, 8, true),
})
export const gif: ImageSupport = ['gif', isGif, gifSize]
