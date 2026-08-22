import { describe, it, expect } from 'vitest'
import { isPsd, psdSize } from '../src/supports/psd.js'
import { readValidImage } from './helper.js'

describe('supports > psd', () => {
  it('should validate psd type', async () => {
    const img = await readValidImage('psd/sample.psd')
    expect(isPsd(img)).toBe(true)
  })

  it('should validate psd size', async () => {
    const img = await readValidImage('psd/sample.psd')
    expect(psdSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should invalidate psd with truncated input', () => {
    expect(() => psdSize(new TextEncoder().encode('8BPS'))).toThrow('Invalid PSD')
  })
})
