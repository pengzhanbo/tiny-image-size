import { describe, it, expect } from 'vitest'
import { isPng, pngSize } from '../src/supports/png.js'
import { readValidImage, readInvalidImage } from './helper.js'

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
    expect(() => isPng(img)).toThrow(TypeError)
    expect(pngSize(img)).toEqual({ width: 123, height: 456 })
  })
})
