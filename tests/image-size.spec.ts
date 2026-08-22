import { describe, it, expect } from 'vitest'
import { tinyImageSize } from '../src/image-size.js'
import { readValidImage } from './helper.js'

describe(tinyImageSize, () => {
  it('should extract image size', async () => {
    const img = await readValidImage('bmp/sample.bmp')
    expect(tinyImageSize(img)).toEqual({ width: 123, height: 456, type: 'bmp' })
  })

  it('should invalidate empty image', () => {
    expect(tinyImageSize(new Uint8Array([]))).toBe(null)
  })

  it('should invalidate image length < 2', () => {
    expect(tinyImageSize(new Uint8Array([1]))).toBe(null)
  })

  it('should invalidate unsupport image type', async () => {
    const img = await readValidImage('bmp/sample.bmp')
    expect(() => tinyImageSize(img, 'unknown' as any)).toThrow('Type unknown is not supported')
  })

  it('should extract image size with explicit type', async () => {
    const img = await readValidImage('bmp/sample.bmp')
    expect(tinyImageSize(img, 'bmp')).toEqual({ width: 123, height: 456, type: 'bmp' })
  })

  it('should invalidate undetermined image type', () => {
    expect(() => tinyImageSize(new Uint8Array([1, 2, 3]))).toThrow('Cannot determine image type')
  })
})
