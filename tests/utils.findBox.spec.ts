import { describe, it, expect } from 'vitest'
import { assertLength, findBox } from '../src/utils.js'

describe('utils > findBox', () => {
  it('should find box by name in Uint8Array', () => {
    // Create a mock box structure: size (4 bytes) + name (4 bytes)
    const boxSize = new Uint8Array([0, 0, 0, 8]) // 8 bytes total
    const boxName = new Uint8Array([116, 101, 115, 116]) // "test"
    const input = new Uint8Array([...boxSize, ...boxName])

    const result = findBox(input, 'test', 0)
    expect(result).toEqual({
      name: 'test',
      offset: 0,
      size: 8,
    })
  })

  it('should return undefined when box is not found', () => {
    const input = new Uint8Array([0, 0, 0, 8, 116, 101, 115, 116])
    const result = findBox(input, 'none', 0)
    expect(result).toBe(undefined)
  })

  it('should handle incomplete box data', () => {
    const input = new Uint8Array([0, 0]) // Too short to be a valid box
    const result = findBox(input, 'test', 0)
    expect(result).toBe(undefined)
  })

  it('should handle box size larger than remaining input', () => {
    // Create a box with size larger than the actual data
    // First 4 bytes indicate a size of 100, but array is only 8 bytes long
    const boxSize = new Uint8Array([0, 0, 0, 100]) // Size of 100 bytes
    const boxName = new Uint8Array([116, 101, 115, 116]) // "test"
    const input = new Uint8Array([...boxSize, ...boxName])

    const result = findBox(input, 'test', 0)
    expect(result).toBe(undefined)
  })

  it('should treat a box with size 0 as extending to the end of the file', () => {
    // A size of 0 means the box extends to the end of the file (ISO BMFF)
    const boxSize = new Uint8Array([0, 0, 0, 0]) // Size of 0 bytes
    const boxName = new Uint8Array([116, 101, 115, 116]) // "test"
    const extra = new Uint8Array([1, 2, 3, 4]) // trailing data after the box header
    const input = new Uint8Array([...boxSize, ...boxName, ...extra])

    const result = findBox(input, 'test', 0)
    expect(result).toEqual({
      name: 'test',
      offset: 0,
      size: input.length,
    })
  })
})

describe('utils > assertLength', () => {
  it('should throw a TypeError when input is shorter than the required length', () => {
    const input = new Uint8Array([1, 2, 3])
    expect(() => assertLength(input, 4, 'Expected at least 4 bytes')).toThrow(TypeError)
    expect(() => assertLength(input, 4, 'Expected at least 4 bytes')).toThrow(
      'Expected at least 4 bytes',
    )
  })

  it('should not throw when input has the required length', () => {
    const input = new Uint8Array([1, 2, 3, 4])
    expect(() => assertLength(input, 4, 'Expected at least 4 bytes')).not.toThrow()
  })
})
