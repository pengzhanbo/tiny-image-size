import { describe, it, expect } from 'vitest'
import { isCur, curSize } from '../src/supports/cur.js'
import { readValidImage, bytesFromHex, hexStr } from './helper.js'

describe('supports > cur', () => {
  it('should validate cur type', async () => {
    const img = await readValidImage('cur/sample.cur')
    expect(isCur(img)).toBe(true)
  })

  it('should extract cur size', async () => {
    const img = await readValidImage('cur/sample.cur')
    expect(curSize(img)).toEqual({ width: 32, height: 32 })
  })

  it('should throw for cur with incomplete header', () => {
    const img = bytesFromHex(hexStr('0000', '0200', '0100'))
    expect(isCur(img)).toBe(true)
    expect(() => curSize(img)).toThrow('Invalid ICO')
  })
})
