import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { uint32 } from '../utils.js'

export const isDds: ImageTypeValidator = (input) =>
  input.length >= 4 && uint32(input, 0, true) === 0x20534444

export const ddsSize: ImageSizeExtractor = (input) => ({
  width: uint32(input, 16, true),
  height: uint32(input, 12, true),
})

export const dds: ImageSupport = ['dds', isDds, ddsSize]
