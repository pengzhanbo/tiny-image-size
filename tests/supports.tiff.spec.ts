import { describe, it, expect } from 'vitest'
import { isTiff, tiffSize } from '../src/supports/tiff.js'
import { readValidImage, bytesFromHex, hexStr } from './helper.js'

describe('supports > tiff', () => {
  it('should validate tiff (big endian)', async () => {
    const img = await readValidImage('tiff/big-endian.tiff')
    expect(isTiff(img)).toBe(true)
    expect(tiffSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate tiff (little endian)', async () => {
    const img = await readValidImage('tiff/little-endian.tiff')
    expect(isTiff(img)).toBe(true)
    expect(tiffSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate tiff (jpeg)', async () => {
    const img = await readValidImage('tiff/jpeg.tiff')
    expect(isTiff(img)).toBe(true)
    expect(tiffSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate tiff (big tiff) and (big endian)', async () => {
    const img = await readValidImage('tiff/bigtiff-big-endian.tiff')
    expect(isTiff(img)).toBe(true)
    expect(tiffSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate tiff (big tiff) and (little endian)', async () => {
    const img = await readValidImage('tiff/bigtiff-little-endian.tiff')
    expect(isTiff(img)).toBe(true)
    expect(tiffSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate tiff (big tiff) jpeg', async () => {
    const img = await readValidImage('tiff/bigtiff-jpeg.tiff')
    expect(isTiff(img)).toBe(true)
    expect(tiffSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should extract tiff size with long values', () => {
    const entry1 = hexStr('0001', '0400', '01000000', '7b000000')
    const entry2 = hexStr('0101', '0400', '01000000', 'c8010000')
    const img = bytesFromHex(hexStr('49492a00', '08000000', '0200', entry1, entry2, '00000000'))
    expect(isTiff(img)).toBe(true)
    expect(tiffSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should invalidate tiff with missing tags', () => {
    const entry = hexStr('e703', '0300', '01000000', '07000000')
    const img = bytesFromHex(hexStr('49492a00', '08000000', '0100', entry))
    expect(isTiff(img)).toBe(true)
    expect(() => tiffSize(img)).toThrow('Invalid Tiff. Missing tags')
  })

  it('should invalidate tiff with bad big tiff header', () => {
    const img = bytesFromHex(hexStr('49492b00', '0900', '0000'))
    expect(isTiff(img)).toBe(true)
    expect(() => tiffSize(img)).toThrow('Invalid BigTIFF header')
  })

  it('should invalidate tiff with oversized long8 value', () => {
    const count = '0100000000000000'
    const entry = hexStr('0001', '1000', '0100000000000000', '0000000000000010')
    const img = bytesFromHex(hexStr('49492b00', '0800', '0000', '1000000000000000', count, entry))
    expect(isTiff(img)).toBe(true)
    expect(() => tiffSize(img)).toThrow('Value too large')
  })
})
