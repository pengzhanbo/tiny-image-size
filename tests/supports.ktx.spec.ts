import { describe, it, expect } from 'vitest'
import { isKtx, ktxSize } from '../src/supports/ktx.js'
import { readValidImage } from './helper.js'

describe('supports > ktx', () => {
  it('should validate ktx type', async () => {
    const img = await readValidImage('ktx/sample.ktx')
    expect(isKtx(img)).toBe(true)
  })

  it('should extract ktx size', async () => {
    const img = await readValidImage('ktx/sample.ktx')
    expect(ktxSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate ktx2 type', async () => {
    const img = await readValidImage('ktx/sample.ktx2')
    expect(isKtx(img)).toBe(true)
  })

  it('should extract ktx2 size', async () => {
    const img = await readValidImage('ktx/sample.ktx2')
    expect(ktxSize(img)).toEqual({ width: 123, height: 456 })
  })
})
