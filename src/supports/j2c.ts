import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { uint32 } from '../utils.js'

export const isJ2c: ImageTypeValidator = (input) =>
  input.length >= 4 && uint32(input, 0) === 0xff4fff51

export const j2cSize: ImageSizeExtractor = (input) => ({
  width: uint32(input, 8),
  height: uint32(input, 12),
})

export const j2c: ImageSupport = ['j2c', isJ2c, j2cSize]
