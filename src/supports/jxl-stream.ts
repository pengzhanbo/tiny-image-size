import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { sliceHex, createBitReader } from '../utils.js'

const extraBitsPerSizeClass = [9, 13, 18, 30]
const aspectRatios = [1, 1.2, 4 / 3, 1.5, 16 / 9, 5 / 4, 2]

export const isJxlStream: ImageTypeValidator = (input) => sliceHex(input, 0, 2) === 'ff0a'

export const jxlStreamSize: ImageSizeExtractor = (input) => {
  const reader = createBitReader(input, true)
  const isSmallImage = reader(1) === 1
  const height = isSmallImage ? 8 * (1 + reader(5)) : 1 + reader(extraBitsPerSizeClass[reader(2)])
  const widthMode = reader(3)
  let width = 0
  if (isSmallImage && widthMode === 0) {
    width = 8 * (1 + reader(5))
  } else if (widthMode === 0) {
    width = 1 + reader(extraBitsPerSizeClass[reader(2)])
  } else {
    width = Math.floor(height * aspectRatios[widthMode - 1]!)
  }

  return { width, height }
}

export const jxlStream: ImageSupport = ['jxl-stream', isJxlStream, jxlStreamSize]
