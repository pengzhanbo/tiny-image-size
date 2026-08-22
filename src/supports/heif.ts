import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { slice, findBox, uint32 } from '../utils.js'

const brands: string[] = ['avif', 'mif1', 'msf1', 'heic', 'heix', 'hevc', 'hevx']

export const isHeif: ImageTypeValidator = (input) => {
  const boxType = slice(input, 4, 8)
  if (boxType !== 'ftyp') {
    return false
  }
  const ftypBox = findBox(input, 'ftyp', 0)
  if (!ftypBox) {
    return false
  }
  const brand = slice(input, ftypBox.offset + 8, ftypBox.offset + 12)
  return brands.includes(brand)
}

export const heifSize: ImageSizeExtractor = (input) => {
  const metaBox = findBox(input, 'meta', 0)
  const iprpBox = metaBox && findBox(input, 'iprp', metaBox.offset + 12)
  const ipcoBox = iprpBox && findBox(input, 'ipco', iprpBox.offset + 8)

  if (!ipcoBox) {
    throw new TypeError('Invalid HEIF, no ipco box found')
  }

  const currentOffset = ipcoBox.offset + 8
  const ispeBox = findBox(input, 'ispe', currentOffset)

  if (!ispeBox) {
    throw new TypeError('Invalid HEIF, no ispe box found')
  }

  const rawWidth = uint32(input, ispeBox.offset + 12)
  const rawHeight = uint32(input, ispeBox.offset + 16)

  const clapBox = findBox(input, 'clap', currentOffset)
  let width = rawWidth
  const height = rawHeight
  if (clapBox && clapBox.offset < ipcoBox.offset + ipcoBox.size) {
    const cropRight = uint32(input, clapBox.offset + 12)
    width = rawWidth - cropRight
  }
  return { width, height }
}

export const heif: ImageSupport = ['heif', isHeif, heifSize]
