import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { assertLength, hasOwn, slice, uint32 } from '../utils.js'

/**
 * ICNS Header
 *
 * | Offset | Size | Purpose                                                |
 * | 0      | 4    | Magic literal, must be "icns" (0x69, 0x63, 0x6e, 0x73) |
 * | 4      | 4    | Length of file, in bytes, msb first.                   |
 *
 */
const SIZE_HEADER = 8 // 4 + 4
const FILE_LENGTH_OFFSET = 4 // MSB => BIG ENDIAN

/**
 * Image Entry
 *
 * | Offset | Size | Purpose                                                          |
 * | 0      | 4    | Icon type, see OSType below.                                     |
 * | 4      | 4    | Length of data, in bytes (including type and length), msb first. |
 * | 8      | n    | Icon data                                                        |
 */
const ENTRY_LENGTH_OFFSET = 4 // MSB => BIG ENDIAN

const ICON_TYPE_SIZE: Record<string, number> = Object.fromEntries([
  ...['icm#', 'icm4', 'icm8', 'ics#', 'ics4', 'ics8', 'is32', 's8mk', 'icp4'].map((name) => [
    name,
    16,
  ]),
  ...['ICON', 'ICN#', 'icl4', 'icl8', 'il32', 'l8mk', 'icp5', 'ic11', 'ic12'].map((name) => [
    name,
    32,
  ]),
  ...['ich4', 'ich8', 'ih32', 'h8mk'].map((name) => [name, 48]),
  ['icp6', 64],
  ...['it32', 't8mk', 'ic07'].map((name) => [name, 128]),
  ...['ic08', 'ic13'].map((name) => [name, 256]),
  ...['ic09', 'ic14'].map((name) => [name, 512]),
  ['ic10', 1024],
])

const ERROR_MESSAGE = 'Invalid ICNS, no sizes found'

export const isIcns: ImageTypeValidator = (input) => slice(input, 0, 4) === 'icns'

export const icnsSize: ImageSizeExtractor = (input) => {
  assertLength(input, 12, ERROR_MESSAGE)
  if (SIZE_HEADER > uint32(input, FILE_LENGTH_OFFSET)) {
    throw new TypeError(ERROR_MESSAGE)
  }
  const type = slice(input, SIZE_HEADER, SIZE_HEADER + ENTRY_LENGTH_OFFSET)
  if (!hasOwn(ICON_TYPE_SIZE, type)) {
    throw new TypeError(ERROR_MESSAGE)
  }
  const size = ICON_TYPE_SIZE[type]!

  return { width: size, height: size }
}

export const icns: ImageSupport = ['icns', isIcns, icnsSize]
