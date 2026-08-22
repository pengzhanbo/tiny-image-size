import { describe, it, expect } from 'vitest'
import { isTga, tgaSize } from '../src/supports/tga.js'
import { readValidImage } from './helper.js'

describe('supports > tga', () => {
  it('should validate tga type', async () => {
    const img = await readValidImage('tga/sample.tga')
    expect(isTga(img)).toBe(true)
  })

  it('should validate tga size', async () => {
    const img = await readValidImage('tga/sample.tga')
    expect(tgaSize(img)).toEqual({ width: 123, height: 456 })
  })
})
