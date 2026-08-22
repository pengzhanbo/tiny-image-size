import { describe, it, expect } from 'vitest'
import { isJxlStream, jxlStreamSize } from '../src/supports/jxl-stream.js'
import { readValidImage, bytesFromHex } from './helper.js'

describe('supports > jxl-stream', () => {
  it('should validate jxl-stream type', async () => {
    const img = await readValidImage('jxl-stream/sample.jxl.stream')
    expect(isJxlStream(img)).toBe(true)
  })

  it('should validate jxl-stream size', async () => {
    const img = await readValidImage('jxl-stream/sample.jxl.stream')
    expect(jxlStreamSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate small rect jxl-stream', async () => {
    const img = await readValidImage('jxl-stream/small_rect.jxl')
    expect(isJxlStream(img)).toBe(true)
    expect(jxlStreamSize(img)).toEqual({ width: 120, height: 80 })
  })

  it('should validate small square jxl-stream', async () => {
    const img = await readValidImage('jxl-stream/small_square.jxl')
    expect(isJxlStream(img)).toBe(true)
    expect(jxlStreamSize(img)).toEqual({ width: 64, height: 64 })
  })

  it('should validate max small jxl-stream', async () => {
    const img = await readValidImage('jxl-stream/max_small.jxl')
    expect(isJxlStream(img)).toBe(true)
    expect(jxlStreamSize(img)).toEqual({ width: 256, height: 256 })
  })

  it('should validate min large jxl-stream', async () => {
    const img = await readValidImage('jxl-stream/min_large.jxl')
    expect(isJxlStream(img)).toBe(true)
    expect(jxlStreamSize(img)).toEqual({ width: 257, height: 257 })
  })

  it('should validate large 16x9 jxl-stream', async () => {
    const img = await readValidImage('jxl-stream/large_16_9.jxl')
    expect(isJxlStream(img)).toBe(true)
    expect(jxlStreamSize(img)).toEqual({ width: 1920, height: 1080 })
  })

  it('should validate large explicit jxl-stream', async () => {
    const img = await readValidImage('jxl-stream/large_explicit.jxl')
    expect(isJxlStream(img)).toBe(true)
    expect(jxlStreamSize(img)).toEqual({ width: 3000, height: 2000 })
  })

  it('should validate small square jxl-stream with width mode 0', () => {
    const img = bytesFromHex('ff0a0f0e')
    expect(isJxlStream(img)).toBe(true)
    expect(jxlStreamSize(img)).toEqual({ width: 64, height: 64 })
  })
})
