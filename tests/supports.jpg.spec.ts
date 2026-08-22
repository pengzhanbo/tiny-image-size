import { describe, it, expect } from 'vitest'
import { isJpg, jpgSize } from '../src/supports/jpg.js'
import { readValidImage, bytesFromHex, hexStr } from './helper.js'

const APP0 = hexStr('ffd8ffe00010', '4a46494600010100000100010000')

describe('supports > jpg', () => {
  it('should validate jpg type', async () => {
    const img = await readValidImage('jpg/sample.jpg')
    expect(isJpg(img)).toBe(true)
  })

  it('should validate jpg size', async () => {
    const img = await readValidImage('jpg/sample.jpg')
    expect(jpgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate exported jpg', async () => {
    const img = await readValidImage('jpg/sampleExported.jpg')
    expect(isJpg(img)).toBe(true)
    expect(jpgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate progressive jpg', async () => {
    const img = await readValidImage('jpg/progressive.jpg')
    expect(isJpg(img)).toBe(true)
    expect(jpgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate optimized jpg', async () => {
    const img = await readValidImage('jpg/optimized.jpg')
    expect(isJpg(img)).toBe(true)
    expect(jpgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate large jpg', async () => {
    const img = await readValidImage('jpg/large.jpg')
    expect(isJpg(img)).toBe(true)
    expect(jpgSize(img)).toEqual({ width: 1600, height: 1200 })
  })

  it('should validate very large jpg', async () => {
    const img = await readValidImage('jpg/very-large.jpg')
    expect(isJpg(img)).toBe(true)
    expect(jpgSize(img)).toEqual({ width: 4800, height: 3600 })
  })

  it('should validate 1x2 flipped big endian jpg', async () => {
    const img = await readValidImage('jpg/1x2-flipped-big-endian.jpg')
    expect(isJpg(img)).toBe(true)
    expect(jpgSize(img)).toEqual({ width: 1, height: 2 })
  })

  it('should validate 1x2 flipped little endian jpg', async () => {
    const img = await readValidImage('jpg/1x2-flipped-little-endian.jpg')
    expect(isJpg(img)).toBe(true)
    expect(jpgSize(img)).toEqual({ width: 1, height: 2 })
  })

  it('should invalidate jpg with truncated segment', () => {
    expect(() =>
      jpgSize(bytesFromHex(hexStr('ffd8ffe00010', '0000000000000000000000000'))),
    ).toThrow('Corrupt JPG, exceeded buffer limits')
  })

  it('should invalidate jpg with non-marker byte', () => {
    expect(() => jpgSize(bytesFromHex(APP0))).toThrow('Corrupt JPG, exceeded buffer limits')
  })

  it('should invalidate jpg with no size found', () => {
    expect(() => jpgSize(bytesFromHex(hexStr(APP0, 'ffd9')))).toThrow('Invalid JPG, no size found')
  })

  it('should invalidate jpg with single trailing byte', () => {
    expect(() => jpgSize(bytesFromHex(hexStr('ffd8', 'ff', '00', '00')))).toThrow(
      'Invalid JPG, no size found',
    )
  })

  it('should invalidate jpg with truncated SOF segment', () => {
    expect(() => jpgSize(bytesFromHex(hexStr('ffd8ffe0', '0002ffc00000')))).toThrow(
      'Invalid JPG, no size found',
    )
  })
})
