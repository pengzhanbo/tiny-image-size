import { describe, it, expect } from 'vitest'
import { isIcns, icnsSize } from '../src/supports/icns.js'
import { readValidImage, bytesFromHex } from './helper.js'

describe('supports > icns', () => {
  it('should validate icns type', async () => {
    const img = await readValidImage('icns/sample.icns')
    expect(isIcns(img)).toBe(true)
  })

  it('should validate icns size', async () => {
    const img = await readValidImage('icns/sample.icns')
    expect(icnsSize(img)).toEqual({ width: 16, height: 16 })
  })

  it('should invalidate icns with truncated input', () => {
    expect(() => icnsSize(new TextEncoder().encode('icns'))).toThrow('Invalid ICNS, no sizes found')
  })

  it('should invalidate icns with short declared length', () => {
    expect(() => icnsSize(bytesFromHex('69636e73' + '00000004' + '00000000'))).toThrow(
      'Invalid ICNS, no sizes found',
    )
  })

  it('should invalidate icns with short header', () => {
    expect(() => icnsSize(bytesFromHex('69636e73' + '00000004'))).toThrow(
      'Invalid ICNS, no sizes found',
    )
  })

  it('should invalidate icns with unknown icon type', () => {
    expect(() => icnsSize(bytesFromHex('69636e73' + '00000010' + '78787878'))).toThrow(
      'Invalid ICNS, no sizes found',
    )
  })
})
