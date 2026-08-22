export const hasOwn = (obj: object, prop: string): prop is keyof typeof obj =>
  Object.prototype.hasOwnProperty.call(obj, prop)

const decoder = new TextDecoder()

/**
 * Slice a Uint8Array to a string.
 *
 * 从 Uint8Array 中切片出一个字符串。
 *
 * @param input The input Uint8Array.
 * @param start The start index of the slice.
 * @param end The end index of the slice.
 * @returns The decoded string.
 */
export function slice(input: Uint8Array, start = 0, end: number = input.length): string {
  return decoder.decode(input.slice(start, end))
}

/**
 * Slice a Uint8Array to a hexadecimal string.
 *
 * 从 Uint8Array 中切片出一个十六进制字符串。
 *
 * @param input The input Uint8Array.
 * @param start The start index of the slice.
 * @param end The end index of the slice.
 * @returns The decoded string.
 */
export function sliceHex(input: Uint8Array, start = 0, end: number = input.length): string {
  return input.slice(start, end).reduce((memo, i) => memo + `0${i.toString(16)}`.slice(-2), '')
}

function createDataView({ buffer, byteOffset }: Uint8Array, offset: number): DataView {
  return new DataView(buffer, byteOffset + offset)
}

/**
 * Read a 16-bit integer from a Uint8Array.
 *
 * 从 Uint8Array 中读取一个 16 位整数。
 *
 * @param input The input Uint8Array. / 输入的 Uint8Array。
 * @param offset The offset to start reading from. / 读取偏移量。
 * @param littleEndian Whether to read the little-endian value / 是否读取小端序值。
 * @returns The integer value.
 */
export function int16(input: Uint8Array, offset = 0, littleEndian?: boolean): number {
  return createDataView(input, offset).getInt16(0, littleEndian)
}

/**
 * Read a 16-bit unsigned integer from a Uint8Array.
 *
 * 从 Uint8Array 中读取一个 16 位无符号整数。
 *
 * @param input The input Uint8Array. / 输入的 Uint8Array。
 * @param offset The offset to start reading from. / 读取偏移量。
 * @param littleEndian Whether to read the little-endian value / 是否读取小端序值。
 * @returns The unsigned integer value.
 */
export function uint16(input: Uint8Array, offset = 0, littleEndian?: boolean): number {
  return createDataView(input, offset).getUint16(0, littleEndian)
}

/**
 * Read a 24-bit unsigned integer from a Uint8Array.
 *
 * 从 Uint8Array 中读取一个 24 位无符号整数。
 *
 * @param input The input Uint8Array. / 输入的 Uint8Array。
 * @param offset The offset to start reading from. / 读取偏移量。
 * @returns The unsigned integer value.
 */
export function uint24LE(input: Uint8Array, offset = 0): number {
  const view = createDataView(input, offset)
  return view.getUint16(0, true) + (view.getUint8(2) << 16)
}

/**
 * Read a 32-bit integer from a Uint8Array.
 *
 * 从 Uint8Array 中读取一个 32 位整数。
 *
 * @param input The input Uint8Array. / 输入的 Uint8Array。
 * @param offset The offset to start reading from. / 读取偏移量。
 * @param littleEndian Whether to read the little-endian value / 是否读取小端序值。
 * @returns The integer value.
 */
export function int32(input: Uint8Array, offset = 0, littleEndian?: boolean): number {
  return createDataView(input, offset).getInt32(0, littleEndian)
}

/**
 * Read a 32-bit unsigned integer from a Uint8Array.
 *
 * 从 Uint8Array 中读取一个 32 位无符号整数。
 *
 * @param input The input Uint8Array. / 输入的 Uint8Array。
 * @param offset The offset to start reading from. / 读取偏移量。
 * @param littleEndian Whether to read the little-endian value / 是否读取小端序值。
 * @returns The unsigned integer value.
 */
export function uint32(input: Uint8Array, offset = 0, littleEndian?: boolean): number {
  return createDataView(input, offset).getUint32(0, littleEndian)
}

/**
 * Read a 64-bit unsigned integer from a Uint8Array.
 *
 * 从 Uint8Array 中读取一个 64 位无符号整数。
 *
 * @param input The input Uint8Array. / 输入的 Uint8Array。
 * @param offset The offset to start reading from. / 读取偏移量。
 * @param littleEndian Whether to read the little-endian value / 是否读取小端序值。
 * @returns The unsigned integer value.
 */
export function uint64(input: Uint8Array, offset = 0, littleEndian?: boolean): bigint {
  return createDataView(input, offset).getBigUint64(0, littleEndian)
}

export interface ImageBox {
  name: string
  offset: number
  size: number
}

/**
 * Read an image box from a Uint8Array.
 *
 * 从 Uint8Array 中读取一个图像盒子。
 *
 * @param input The input Uint8Array. / 输入的 Uint8Array。
 * @param offset The offset to start reading from. / 读取偏移量。
 * @returns The image box.
 */
function readBox(input: Uint8Array, offset: number): ImageBox | undefined {
  if (input.length - offset < 4) {
    return
  }

  const size = uint32(input, offset)

  if (input.length - offset < size) {
    return
  }

  return {
    name: slice(input, offset + 4, offset + 8),
    offset,
    size,
  }
}

/**
 * Find an image box in a Uint8Array.
 *
 * 在 Uint8Array 中查找一个图像盒子。
 *
 * @param input The input Uint8Array. / 输入的 Uint8Array。
 * @param boxName The name of the box to find. / 要查找的盒子名称。
 * @param currentOffset The offset to start searching from. / 从当前偏移量开始搜索。
 * @returns The image box.
 */
export function findBox(
  input: Uint8Array,
  boxName: string,
  currentOffset: number,
): ImageBox | undefined {
  while (currentOffset < input.length) {
    const box = readBox(input, currentOffset)
    if (!box) {
      break
    }
    if (box.name === boxName) {
      return box
    }
    /* v8 ignore next -- @preserve */
    currentOffset += box.size > 0 ? box.size : 8
  }
}

export type ReadBits = (length?: number) => number

/**
 * Create a bit reader from a Uint8Array.
 *
 * 创建一个从 Uint8Array 中读取位的函数。
 *
 * @param input The input Uint8Array. / 输入的 Uint8Array。
 * @param littleEndian Whether to read the little-endian value / 是否读取小端序值。
 * @returns The bit reader.
 */
export function createBitReader(input: Uint8Array, littleEndian?: boolean): ReadBits {
  let byteOffset = 2
  let bitOffset = 0

  return (length = 1) => {
    let result = 0
    let bitsRead = 0

    while (bitsRead < length) {
      if (byteOffset >= input.length) {
        throw new Error('Reached end of input')
      }

      const currentByte = input[byteOffset]!
      const bitsLeft = 8 - bitOffset
      const bitsToRead = Math.min(length - bitsRead, bitsLeft)

      if (littleEndian) {
        const mask = (1 << bitsToRead) - 1
        const bits = (currentByte >> bitOffset) & mask
        result |= bits << bitsRead
      } else {
        const mask = ((1 << bitsToRead) - 1) << (8 - bitOffset - bitsToRead)
        const bits = (currentByte & mask) >> (8 - bitOffset - bitsToRead)
        result = (result << bitsToRead) | bits
      }

      bitsRead += bitsToRead
      bitOffset += bitsToRead

      if (bitOffset === 8) {
        byteOffset++
        bitOffset = 0
      }
    }

    return result
  }
}
