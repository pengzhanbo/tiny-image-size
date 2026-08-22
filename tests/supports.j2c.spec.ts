import { describe, it, expect } from 'vitest'
import { isJ2c, j2cSize } from '../src/supports/j2c.js'
import { readValidImage, bytesFromHex } from './helper.js'

describe('supports > j2c', () => {
  it('should validate j2c type', async () => {
    const img = await readValidImage('j2c/sample.j2c')
    expect(isJ2c(img)).toBe(true)
  })

  it('should validate j2c size', async () => {
    const img = await readValidImage('j2c/sample.j2c')
    expect(j2cSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should invalidate j2c with wrong magic', () => {
    expect(isJ2c(bytesFromHex('00000000'))).toBe(false)
  })

  it('should invalidate j2c with truncated input', () => {
    expect(() => j2cSize(bytesFromHex('ff4fff51'))).toThrow('Invalid J2C')
  })
})
