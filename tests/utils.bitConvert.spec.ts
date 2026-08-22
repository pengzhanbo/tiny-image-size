import { describe, it, expect } from 'vitest'
import { int16, int32, uint16, uint24LE, uint32, uint64 } from '../src/utils.js'

describe('utils > int16', () => {
  it('should read 16-bit signed integer (little-endian)', () => {
    const input = new Uint8Array([255, 255]) // -1 in 16-bit signed
    expect(int16(input, 0, true)).toBe(-1)
  })

  it('should read 16-bit unsigned integer (big-endian)', () => {
    const input = new Uint8Array([1, 0]) // 256 in big-endian
    expect(int16(input, 0)).toBe(256)
  })

  it('should read 16-bit unsigned integer (little-endian)', () => {
    const input = new Uint8Array([0, 1]) // 256 in little-endian
    expect(int16(input, 0, true)).toBe(256)
  })
})

describe('utils > int32', () => {
  it('should read 32-bit signed integer (little-endian)', () => {
    const input = new Uint8Array([255, 255, 255, 255]) // -1 in 32-bit signed
    expect(int32(input, 0, true)).toBe(-1)
  })

  it('should read 32-bit unsigned integer (big-endian)', () => {
    const input = new Uint8Array([0, 0, 1, 0]) // 256 in big-endian
    expect(int32(input, 0)).toBe(256)
  })
})

describe('utils > uint24LE', () => {
  it('should read 24-bit unsigned integer (little-endian)', () => {
    const input = new Uint8Array([1, 1, 1]) // 65793 in little-endian
    expect(uint24LE(input, 0)).toBe(65793)
  })
})

describe('utils > uint16', () => {
  it('should read 16-bit unsigned integer (big-endian)', () => {
    const input = new Uint8Array([1, 0]) // 256 in big-endian
    expect(uint16(input, 0)).toBe(256)
  })

  it('should read 16-bit unsigned integer (little-endian)', () => {
    const input = new Uint8Array([0, 1]) // 256 in little-endian
    expect(uint16(input, 0, true)).toBe(256)
  })
})

describe('utils > uint32', () => {
  it('should read 32-bit unsigned integer (big-endian)', () => {
    const input = new Uint8Array([0, 0, 1, 0]) // 256 in big-endian
    expect(uint32(input, 0)).toBe(256)
  })

  it('should read 32-bit unsigned integer (little-endian)', () => {
    const input = new Uint8Array([0, 1, 0, 0]) // 256 in little-endian
    expect(uint32(input, 0, true)).toBe(256)
  })
})

describe('utils > uint64', () => {
  it('should read zero correctly in both endianness', () => {
    const input = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0])
    expect(uint64(input, 0)).toBe(0n)
    expect(uint64(input, 0, true)).toBe(0n)
  })

  it('should read 2^32 in big-endian', () => {
    // 2^32 = 4294967296 = 0x0000000100000000
    const input = new Uint8Array([0, 0, 0, 1, 0, 0, 0, 0])
    expect(uint64(input, 0)).toBe(4294967296n)
  })

  it('should read 2^32 in little-endian', () => {
    // 2^32 = 4294967296 = 0x0000000100000000
    const input = new Uint8Array([0, 0, 0, 0, 1, 0, 0, 0])
    expect(uint64(input, 0, true)).toBe(4294967296n)
  })

  it('should read max uint64 value in both endianness', () => {
    // max uint64 = 2^64 - 1 = 18446744073709551615
    const input = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255])
    const expected = 18446744073709551615n
    expect(uint64(input, 0)).toBe(expected)
    expect(uint64(input, 0, true)).toBe(expected)
  })
})
