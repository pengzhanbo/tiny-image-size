import { describe, it, expect } from 'vitest'
import { isIco, icoSize } from '../src/supports/ico.js'
import { readValidImage, bytesFromHex, hexStr } from './helper.js'

describe('supports > ico', () => {
  it('should validate ico type', async () => {
    const img = await readValidImage('ico/sample.ico')
    expect(isIco(img)).toBe(true)
    const compressed = await readValidImage('ico/sample-compressed.ico')
    expect(isIco(compressed)).toBe(true)
  })

  it('should validate ico size', async () => {
    const img = await readValidImage('ico/sample.ico')
    expect(icoSize(img)).toEqual({ width: 32, height: 32 })
    const compressed = await readValidImage('ico/sample-compressed.ico')
    expect(icoSize(compressed)).toEqual({ width: 32, height: 32 })
  })

  it('should validate 256 ico', async () => {
    const img = await readValidImage('ico/sample-256.ico')
    expect(isIco(img)).toBe(true)
    expect(icoSize(img)).toEqual({ width: 256, height: 256 })
  })

  it('should validate 256 ico compressed', async () => {
    const compressed = await readValidImage('ico/sample-256-compressed.ico')
    expect(isIco(compressed)).toBe(true)
    expect(icoSize(compressed)).toEqual({ width: 256, height: 256 })
  })

  it('should validate multiple ico', async () => {
    const img = await readValidImage('ico/multi-size.ico')
    expect(isIco(img)).toBe(true)
    expect(icoSize(img)).toEqual({ width: 256, height: 256 })
  })

  it('should validate multiple ico compressed', async () => {
    const compressed = await readValidImage('ico/multi-size-compressed.ico')
    expect(isIco(compressed)).toBe(true)
    expect(icoSize(compressed)).toEqual({ width: 256, height: 256 })
  })

  it('should throw for ico with incomplete header', () => {
    const img = bytesFromHex(hexStr('0000', '0100', '0100'))
    expect(isIco(img)).toBe(true)
    expect(() => icoSize(img)).toThrow('Invalid ICO')
  })
})
