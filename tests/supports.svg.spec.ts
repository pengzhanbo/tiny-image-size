import { describe, it, expect } from 'vitest'
import { isSvg, svgSize } from '../src/supports/svg.js'
import { readValidImage, readInvalidImage } from './helper.js'

describe('supports > svg', () => {
  it('should validate svg with width and height', async () => {
    const img = await readValidImage('svg/width-height.svg')
    expect(isSvg(img)).toBe(true)
    expect(svgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate svg with viewBox (0 0 123 456)', async () => {
    const img = await readValidImage('svg/viewbox.svg')
    expect(isSvg(img)).toBe(true)
    expect(svgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate svg with (height="456px" viewBox="0 0 246 912")', async () => {
    const img = await readValidImage('svg/viewbox-height.svg')
    expect(isSvg(img)).toBe(true)
    expect(svgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate svg with (width="123px" viewBox="0 0 246 912")', async () => {
    const img = await readValidImage('svg/viewbox-width.svg')
    expect(isSvg(img)).toBe(true)
    expect(svgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate svg with (width="123px" height="456px" viewBox="0 0 246 912")', async () => {
    const img = await readValidImage('svg/viewbox-width-height.svg')
    expect(isSvg(img)).toBe(true)
    expect(svgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate svg with [viewBox -  width - onclick - height]', async () => {
    const img = await readValidImage('svg/viewbox-width-height-brackets.svg')
    expect(isSvg(img)).toBe(true)
    expect(svgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate svg with units', async () => {
    const img = await readValidImage('svg/viewbox-units.svg')
    expect(isSvg(img)).toBe(true)
    expect(svgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate svg with lowercase viewBox', async () => {
    const img = await readValidImage('svg/viewbox-lowercase.svg')
    expect(isSvg(img)).toBe(true)
    expect(svgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate svg with units-inches', async () => {
    const img = await readValidImage('svg/units-inches.svg')
    expect(isSvg(img)).toBe(true)
    expect(svgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate svg with single quotes', async () => {
    const img = await readValidImage('svg/single-quotes.svg')
    expect(isSvg(img)).toBe(true)
    expect(svgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate svg with percentage', async () => {
    const img = await readValidImage('svg/percentage.svg')
    expect(isSvg(img)).toBe(true)
    expect(svgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate svg with exponent width height', async () => {
    const img = await readValidImage('svg/exponent-width-height.svg')
    expect(isSvg(img)).toBe(true)
    expect(svgSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate svg with ignore stroke width', async () => {
    const img = await readValidImage('svg/ignore-stroke-width.svg')
    expect(isSvg(img)).toBe(true)
    expect(svgSize(img)).toEqual({ width: 123, height: 456 })
  })

  // ------------ invalidate ------------
  it('should invalidate svg with width but no height', async () => {
    const img = await readInvalidImage('width.svg')
    expect(isSvg(img)).toBe(true)
    expect(() => svgSize(img)).toThrow('Invalid SVG')
  })

  it('should invalidate svg with no quotes', async () => {
    const img = await readInvalidImage('no-quotes.svg')
    expect(isSvg(img)).toBe(true)
    expect(() => svgSize(img)).toThrow('Invalid SVG')
  })

  it('should invalidate svg with malformed viewBox', async () => {
    const img = await readInvalidImage('malformed.svg')
    expect(isSvg(img)).toBe(true)
    expect(() => svgSize(img)).toThrow('Invalid SVG')
  })

  it('should invalidate svg with broken quotes', async () => {
    const img = await readInvalidImage('broken-quotes.svg')
    expect(isSvg(img)).toBe(true)
    expect(() => svgSize(img)).toThrow('Invalid SVG')
  })

  it('should invalidate svg without attributes', () => {
    const img = new TextEncoder().encode('<svg></svg>')
    expect(isSvg(img)).toBe(false)
    expect(() => svgSize(img)).toThrow('Invalid SVG')
  })

  it('should validate svg with unparseable viewBox width', () => {
    const img = new TextEncoder().encode('<svg width="123" viewBox="0 0 123"></svg>')
    expect(isSvg(img)).toBe(true)
    const size = svgSize(img)
    expect(size.width).toBe(123)
    expect(Number.isNaN(size.height)).toBe(true)
  })
})
