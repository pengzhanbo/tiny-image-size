import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { int32, uint32 } from '../utils.js'

export const isBmp: ImageTypeValidator = (input) =>
  input[0] === 0x42 /* 'B' */ && input[1] === 0x4d /* 'M' */

export const bmpSize: ImageSizeExtractor = (input) => ({
  width: uint32(input, 18, true),
  height: Math.abs(int32(input, 22, true)),
})

export const bmp: ImageSupport = ['bmp', isBmp, bmpSize]
