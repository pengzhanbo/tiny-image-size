import { describe, it, expect } from 'vitest'
import { isPnm, pnmSize } from '../src/supports/pnm.js'
import { readValidImage } from './helper.js'

describe('supports > pnm', () => {
  it('should validate pnm (pam)', async () => {
    const img = await readValidImage('pnm/sample.pam')
    expect(isPnm(img)).toBe(true)
    expect(pnmSize(img)).toEqual({ width: 123, height: 456 })
  })
  it('should validate pnm (pbm)', async () => {
    const img = await readValidImage('pnm/sample.pbm')
    expect(isPnm(img)).toBe(true)
    expect(pnmSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate pnm (pfm)', async () => {
    const img = await readValidImage('pnm/sample.pfm')
    expect(isPnm(img)).toBe(true)
    expect(pnmSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate pnm (pgm)', async () => {
    const img = await readValidImage('pnm/sample.pgm')
    expect(isPnm(img)).toBe(true)
    expect(pnmSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate pnm (ppm)', async () => {
    const img = await readValidImage('pnm/sample.ppm')
    expect(isPnm(img)).toBe(true)
    expect(pnmSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate ascii pnm (pbm)', async () => {
    const img = await readValidImage('pnm/sample-ascii.pbm')
    expect(isPnm(img)).toBe(true)
    expect(pnmSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate ascii pnm (pgm)', async () => {
    const img = await readValidImage('pnm/sample-ascii.pgm')
    expect(isPnm(img)).toBe(true)
    expect(pnmSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate ascii pnm (ppm)', async () => {
    const img = await readValidImage('pnm/sample-ascii.ppm')
    expect(isPnm(img)).toBe(true)
    expect(pnmSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate pam with comment lines', () => {
    const img = new TextEncoder().encode('P7\n0123456789ABCDEFG\nWIDTH 123\nHEIGHT 456\n')
    expect(isPnm(img)).toBe(true)
    expect(pnmSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate pam with key-only lines', () => {
    const img = new TextEncoder().encode('P7\nDEPTH\nWIDTH 123\nHEIGHT 456\n')
    expect(isPnm(img)).toBe(true)
    expect(pnmSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should invalidate pnm with missing dimensions', () => {
    const img = new TextEncoder().encode('P6\n123\n')
    expect(isPnm(img)).toBe(true)
    expect(() => pnmSize(img)).toThrow('Invalid PNM')
  })

  it('should invalidate pnm with non-numeric width', () => {
    const img = new TextEncoder().encode('P1\nabc def\n')
    expect(isPnm(img)).toBe(true)
    expect(() => pnmSize(img)).toThrow('Invalid PNM')
  })

  it('should invalidate pnm with non-numeric height', () => {
    const img = new TextEncoder().encode('P1\n123 abc\n')
    expect(isPnm(img)).toBe(true)
    expect(() => pnmSize(img)).toThrow('Invalid PNM')
  })

  it('should invalidate pnm with negative width', () => {
    const img = new TextEncoder().encode('P1\n-123 456\n')
    expect(isPnm(img)).toBe(true)
    expect(() => pnmSize(img)).toThrow('Invalid PNM')
  })

  it('should invalidate pnm with negative height', () => {
    const img = new TextEncoder().encode('P1\n123 -456\n')
    expect(isPnm(img)).toBe(true)
    expect(() => pnmSize(img)).toThrow('Invalid PNM')
  })

  it('should invalidate pam with non-numeric width', () => {
    const img = new TextEncoder().encode('P7\nWIDTH abc\nHEIGHT 456\n')
    expect(isPnm(img)).toBe(true)
    expect(() => pnmSize(img)).toThrow('Invalid PNM')
  })

  it('should invalidate pam with negative width', () => {
    const img = new TextEncoder().encode('P7\nWIDTH -1\nHEIGHT 456\n')
    expect(isPnm(img)).toBe(true)
    expect(() => pnmSize(img)).toThrow('Invalid PNM')
  })

  it('should ignore non-dimension pam tokens', () => {
    const img = new TextEncoder().encode('P7\nMAXVAL 255\nWIDTH 123\nHEIGHT 456\n')
    expect(isPnm(img)).toBe(true)
    expect(pnmSize(img)).toEqual({ width: 123, height: 456 })
  })
})
