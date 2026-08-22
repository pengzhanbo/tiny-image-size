import { describe, it, expect } from 'vitest'
import { isHeif, heifSize } from '../src/supports/heif.js'
import { readValidImage, bytesFromHex, hexStr } from './helper.js'

const Ftyp = hexStr('00000014', '66747970', '61766966', '00000000', '61766966')

describe('supports > heif', () => {
  it('should validate heif type', async () => {
    const img = await readValidImage('heif/sample.heif')
    expect(isHeif(img)).toBe(true)
  })
  it('should extract heif size', async () => {
    const img = await readValidImage('heif/sample.heif')
    expect(heifSize(img)).toEqual({ width: 123, height: 456 })
  })

  it('should validate heif (avif) type', async () => {
    const avif = await readValidImage('heif/sample.avif')
    expect(isHeif(avif)).toBe(true)
  })

  it('should validate heif (avif) size', async () => {
    const avif = await readValidImage('heif/sample.avif')
    expect(heifSize(avif)).toEqual({ width: 123, height: 456 })
  })

  it('should validate heif (heic) type', async () => {
    const heic = await readValidImage('heif/sample.heic')
    expect(isHeif(heic)).toBe(true)
  })

  it('should validate heif (heic) size', async () => {
    const heic = await readValidImage('heif/sample.heic')
    expect(heifSize(heic)).toEqual({ width: 123, height: 456 })
  })

  it('should validate garbled avif', async () => {
    const avif = await readValidImage('heif/sample-garbled.avif')
    expect(isHeif(avif)).toBe(true)
    expect(heifSize(avif)).toEqual({ width: 123, height: 456 })
  })

  it('should validate multi heic', async () => {
    const heic = await readValidImage('heif/sample-multi.heic')
    expect(isHeif(heic)).toBe(true)
    expect(heifSize(heic)).toEqual({ width: 123, height: 456 })
  })

  it('should invalidate heif with truncated ftyp box', () => {
    expect(isHeif(bytesFromHex(hexStr('00000014', '66747970', '61766966', '0000')))).toBe(false)
  })

  it('should invalidate heif with no meta box', () => {
    expect(() => heifSize(bytesFromHex(Ftyp))).toThrow('Invalid HEIF, no ipco box found')
  })

  it('should invalidate heif with no iprp box', () => {
    const meta = hexStr('0000000c', '6d657461', '00000000')
    expect(() => heifSize(bytesFromHex(Ftyp + meta))).toThrow('Invalid HEIF, no ipco box found')
  })

  it('should invalidate heif with no ispe box', () => {
    const colr = hexStr('0000000c', '636f6c72', '00000000')
    const ipco = hexStr('00000014', '6970636f') + colr
    const iprp = hexStr('0000001c', '69707270') + ipco
    const meta = hexStr('00000028', '6d657461', '00000000') + iprp
    expect(() => heifSize(bytesFromHex(Ftyp + meta))).toThrow('Invalid HEIF, no ispe box found')
  })

  it('should extract heif size with clap crop', () => {
    const ispe = hexStr('00000014', '69737065', '00000000', '0000007b', '000001c8')
    const clap = hexStr('00000010', '636c6170', '00000000', '00000001')
    const ipco = hexStr('0000002c', '6970636f') + ispe + clap
    const iprp = hexStr('00000034', '69707270') + ipco
    const meta = hexStr('00000040', '6d657461', '00000000') + iprp
    expect(heifSize(bytesFromHex(Ftyp + meta))).toEqual({ width: 122, height: 456 })
  })
})
