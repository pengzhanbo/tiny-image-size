import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { uint32, findBox, slice } from '../utils.js'

export const isJp2: ImageTypeValidator = (input) => {
  const boxType = slice(input, 4, 8)
  if (boxType !== 'jP  ') {
    return false
  }

  const ftypBox = findBox(input, 'ftyp', 0)
  if (!ftypBox) {
    return false
  }

  const brand = slice(input, ftypBox.offset + 8, ftypBox.offset + 12)
  return brand === 'jp2 '
}

export const jp2Size: ImageSizeExtractor = (input) => {
  const jp2hBox = findBox(input, 'jp2h', 0)
  const ihdrBox = jp2hBox && findBox(input, 'ihdr', jp2hBox.offset + 8)

  if (!ihdrBox) {
    throw new TypeError('Unsupported JPEG 2000 format')
  }

  return {
    height: uint32(input, ihdrBox.offset + 8),
    width: uint32(input, ihdrBox.offset + 12),
  }
}

export const jp2: ImageSupport = ['jp2', isJp2, jp2Size]
