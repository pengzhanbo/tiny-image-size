import { describe, it, expect } from 'vitest'
import { isBmp, bmpSize } from '../src/supports/bmp.js'
import { readValidImage } from './helper.js'

describe('supports > bmp', () => {
  it('should validate bmp type', async () => {
    const img = await readValidImage('bmp/sample.bmp')
    expect(isBmp(img)).toBe(true)
  })

  it('should extract bmp size', async () => {
    const img = await readValidImage('bmp/sample.bmp')
    expect(bmpSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should invalidate bmp with truncated input', () => {
    expect(() => bmpSize(new Uint8Array([0x42, 0x4d]))).toThrow('Invalid BMP')
  })
})
