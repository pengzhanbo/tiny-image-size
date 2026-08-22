import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { assertLength, uint16, uint32, slice, sliceHex, uint64 } from '../utils.js'

const TAG_WIDTH = 256
const TAG_HEIGHT = 257

const TYPE_SHORT = 3
const TYPE_LONG = 4
const TYPE_LONG8 = 16

const ENTRY_SIZE_STANDARD = 12
const ENTRY_SIZE_BIG = 20

const COUNT_SIZE_STANDARD = 2
const COUNT_SIZE_BIG = 8

function readTagValue(
  input: Uint8Array,
  type: number,
  offset: number,
  isBigEndian: boolean,
): number {
  switch (type) {
    case TYPE_SHORT:
      return uint16(input, offset, !isBigEndian)
    case TYPE_LONG:
      return uint32(input, offset, !isBigEndian)
    case TYPE_LONG8: {
      const value = Number(uint64(input, offset, !isBigEndian))
      if (value > Number.MAX_SAFE_INTEGER) {
        throw new TypeError('Value too large')
      }
      return value
    }
    /* v8 ignore next -- @preserve */
    default:
      return 0
  }
}

function nextTag(input: Uint8Array, isBigTiff: boolean): Uint8Array | undefined {
  const entrySize = isBigTiff ? ENTRY_SIZE_BIG : ENTRY_SIZE_STANDARD
  if (input.length > entrySize) {
    return input.slice(entrySize)
  }
}

interface TIFFTags {
  [key: number]: number
}

function extractTags(input: Uint8Array, isBigEndian: boolean, isBigTiff: boolean): TIFFTags {
  const tags: TIFFTags = {}
  const entrySize = isBigTiff ? ENTRY_SIZE_BIG : ENTRY_SIZE_STANDARD

  let temp: Uint8Array | undefined = input
  while (temp && temp.length >= entrySize) {
    const code = uint16(temp, 0, !isBigEndian)

    if (code === 0) {
      break
    }

    const type = uint16(temp, 2, !isBigEndian)
    const length = isBigTiff ? Number(uint64(temp, 4, !isBigEndian)) : uint32(temp, 4, !isBigEndian)

    if (
      length === 1 &&
      (type === TYPE_SHORT || type === TYPE_LONG || (isBigTiff && type === TYPE_LONG8))
    ) {
      const valueOffset = isBigTiff ? 12 : 8
      tags[code] = readTagValue(temp, type, valueOffset, isBigEndian)
    }

    temp = nextTag(temp, isBigTiff)
  }

  return tags
}

export const isTiff: ImageTypeValidator = (input) => {
  const hex = sliceHex(input, 0, 4)
  return (
    hex === '49492a00' /* Little Endian */ ||
    hex === '4d4d002a' /* Big Endian */ ||
    hex === '49492b00' /* BigTIFF Little Endian */ ||
    hex === '4d4d002b' /* BigTIFF Big Endian */
  )
}

export const tiffSize: ImageSizeExtractor = (input) => {
  const signature = slice(input, 0, 2)
  const isBigEndian = signature === 'MM'
  const version = uint16(input, 2, !isBigEndian)
  const isBigTiff = version === 43

  if (isBigTiff) {
    const byteSize = uint16(input, 4, !isBigEndian)
    const reserved = uint16(input, 6, !isBigEndian)
    if (byteSize !== 8 || reserved !== 0) {
      throw new TypeError('Invalid BigTIFF header')
    }
    // BigTIFF 头至少 16 字节，否则读取 ifdOffset（uint64@8）会越界。
    assertLength(input, 16, 'Invalid BigTIFF header')
  }

  const ifdOffset = isBigTiff
    ? Number(uint64(input, 8, !isBigEndian))
    : uint32(input, 4, !isBigEndian)
  const entryCountSize = isBigTiff ? COUNT_SIZE_BIG : COUNT_SIZE_STANDARD
  const ifdBuffer = input.slice(ifdOffset + entryCountSize)
  const tags = extractTags(ifdBuffer, isBigEndian, isBigTiff)

  const width = tags[TAG_WIDTH]
  const height = tags[TAG_HEIGHT]

  if (!width || !height) {
    throw new TypeError('Invalid Tiff. Missing tags')
  }

  return { width, height }
}

export const tiff: ImageSupport = ['tiff', isTiff, tiffSize]
