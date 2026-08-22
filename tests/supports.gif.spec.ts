import { describe, it, expect } from 'vitest'
import { isGif, gifSize } from '../src/supports/gif.js'
import { readValidImage } from './helper.js'

describe('supports > gif', () => {
  it('should validate gif type', async () => {
    const img = await readValidImage('gif/sample.gif')
    expect(isGif(img)).toBe(true)
  })

  it('should extract gif size', async () => {
    const img = await readValidImage('gif/sample.gif')
    expect(gifSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should invalidate gif with truncated input', () => {
    expect(() => gifSize(new TextEncoder().encode('GIF89a'))).toThrow('Invalid GIF')
  })
})
