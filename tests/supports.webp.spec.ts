import { describe, it, expect } from 'vitest'
import { isWebp, webpSize } from '../src/supports/webp.js'
import { readValidImage, bytesFromHex, hexStr } from './helper.js'

const RIFF = hexStr('52494646', '00000000', '57454250')

describe('supports > webp', () => {
  it('should validate webp lossy', async () => {
    const img = await readValidImage('webp/lossy.webp')
    expect(isWebp(img)).toBe(true)
    expect(webpSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate webp lossless', async () => {
    const img = await readValidImage('webp/lossless.webp')
    expect(isWebp(img)).toBe(true)
    expect(webpSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate webp extended', async () => {
    const img = await readValidImage('webp/extended.webp')
    expect(isWebp(img)).toBe(true)
    expect(webpSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should invalidate webp vp8x with invalid flags', () => {
    const img = bytesFromHex(RIFF + hexStr('56503858', '00000000', '80', '000000000000000000'))
    expect(() => webpSize(img)).toThrow('Invalid WebP')
  })

  it('should invalidate webp with unknown chunk', () => {
    const img = bytesFromHex(RIFF + hexStr('58585858', '00000000000000000000'))
    expect(() => webpSize(img)).toThrow('Invalid WebP')
  })
})
