import { describe, it, expect } from 'vitest'
import { isPng, pngSize } from '../src/supports/png.js'
import { bytesFromHex, hexStr, readValidImage, readInvalidImage } from './helper.js'

describe('supports > png', () => {
  it('should validate png type', async () => {
    const img = await readValidImage('png/sample.png')
    expect(isPng(img)).toBe(true)
  })

  it('should extract png size', async () => {
    const img = await readValidImage('png/sample.png')
    expect(pngSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate fried png', async () => {
    const img = await readValidImage('png/sample_fried.png')
    expect(isPng(img)).toBe(true)
    expect(pngSize(img)).toEqual({ width: 128, height: 68 })
  })

  it('should invalidate png', async () => {
    const img = await readInvalidImage('sample.png')
    expect(isPng(img)).toBe(false)
    expect(() => pngSize(img)).toThrow('Invalid PNG')
  })

  it('should invalidate png with non-IHDR first chunk', () => {
    const img = bytesFromHex(hexStr('89504e47', '0d0a1a0a', '0000000d', '58585858'))
    expect(isPng(img)).toBe(false)
    expect(() => pngSize(img)).toThrow('Invalid PNG')
  })

  it('should invalidate truncated png with IHDR chunk', () => {
    const img = bytesFromHex(hexStr('89504e47', '0d0a1a0a', '0000000d', '49484452'))
    expect(() => pngSize(img)).toThrow('Invalid PNG')
  })
})
