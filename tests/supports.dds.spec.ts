import { describe, it, expect } from 'vitest'
import { isDds, ddsSize } from '../src/supports/dds.js'
import { readValidImage } from './helper.js'

describe('supports > dds', () => {
  it('should validate dds type', async () => {
    const img = await readValidImage('dds/sample.dds')
    expect(isDds(img)).toBe(true)
  })

  it('should extract dds size', async () => {
    const img = await readValidImage('dds/sample.dds')
    expect(ddsSize(img)).toEqual({ width: 123, height: 456 })
  })
})
