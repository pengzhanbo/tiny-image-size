import { describe, it, expect } from 'vitest'
import { isCur, curSize } from '../src/supports/cur.js'
import { readValidImage } from './helper.js'

describe('supports > cur', () => {
  it('should validate cur type', async () => {
    const img = await readValidImage('cur/sample.cur')
    expect(isCur(img)).toBe(true)
  })

  it('should extract cur size', async () => {
    const img = await readValidImage('cur/sample.cur')
    expect(curSize(img)).toEqual({ width: 32, height: 32 })
  })
})
