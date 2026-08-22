import { describe, it, expect } from 'vitest'
import { isJp2, jp2Size } from '../src/supports/jp2.js'
import { readValidImage, bytesFromHex } from './helper.js'

describe('supports > jp2', () => {
  it('should validate jp2 type', async () => {
    const img = await readValidImage('jp2/sample.jp2')
    expect(isJp2(img)).toBe(true)
  })

  it('should validate jp2 size', async () => {
    const img = await readValidImage('jp2/sample.jp2')
    expect(jp2Size(img)).toEqual({ width: 123, height: 456 })
  })

  it('should invalidate jp2 with truncated ftyp box', () => {
    expect(isJp2(bytesFromHex('0000000c' + '6a502020' + '00000000'))).toBe(false)
  })

  it('should invalidate jp2 with no ihdr box', () => {
    const sig = '0000000c' + '6a502020' + '00000000'
    const ftyp = '00000014' + '66747970' + '6a703220' + '00000000' + '6a703220'
    const jp2h = '00000016' + '6a703268'
    const colr = '0000000c' + '636f6c72' + '00000000'
    expect(() => jp2Size(bytesFromHex(sig + ftyp + jp2h + colr))).toThrow(
      'Unsupported JPEG 2000 format',
    )
  })
})
