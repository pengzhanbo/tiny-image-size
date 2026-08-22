import { describe, it, expect } from 'vitest'
import { isJxl, jxlSize } from '../src/supports/jxl.js'
import { readValidImage, bytesFromHex, hexStr } from './helper.js'

describe('supports > jxl', () => {
  it('should validate jp2 type', async () => {
    const img = await readValidImage('jxl/sample.jxl')
    expect(isJxl(img)).toBe(true)
  })

  it('should validate jp2 size', async () => {
    const img = await readValidImage('jxl/sample.jxl')
    expect(jxlSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should extract jxl size from jxlc box', () => {
    expect(jxlSize(bytesFromHex(hexStr('0000000c', '6a786c63', 'ff0a0f0e')))).toEqual({
      width: 64,
      height: 64,
    })
  })

  it('should extract jxl size from jxlp boxes with trailing data', () => {
    const jxlp = hexStr('00000010', '6a786c70', '00000000', 'ff0a0f0e')
    expect(jxlSize(bytesFromHex(hexStr(jxlp, '0000')))).toEqual({ width: 64, height: 64 })
  })

  it('should invalidate jxl with no codestream', () => {
    expect(() => jxlSize(bytesFromHex(hexStr('0000000c', '66726565', '00000000')))).toThrow(
      'No codestream found in JXL container',
    )
  })

  it('should invalidate jxl with truncated ftyp box', () => {
    expect(isJxl(bytesFromHex(hexStr('0000000c', '4a584c20', '00000000')))).toBe(false)
  })
})
