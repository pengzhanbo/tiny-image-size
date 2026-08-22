import { describe, it, expect } from 'vitest'
import { hasOwn, slice, sliceHex } from '../src/utils.js'

describe('utils > slice', () => {
  it('should convert unit8Array to utf8 string', () => {
    const input = new Uint8Array([72, 101, 108, 108, 111]) // "Hello"
    const output = slice(input, 0, 5)
    expect(output).toBe('Hello')
  })

  it('should convert unit8Array to utf8 string with star and end', () => {
    const input = new Uint8Array([72, 101, 108, 108, 111]) // "Hello"
    const output = slice(input, 1, 4)
    expect(output).toBe('ell')
  })
})

describe('utils > sliceHex', () => {
  it('should convert unit8Array to hex string', () => {
    const input = new Uint8Array([255, 0, 16])
    const output = sliceHex(input)
    expect(output).toBe('ff0010')
  })

  it('should convert unit8Array to hex string with star and end', () => {
    const input = new Uint8Array([255, 0, 16])
    const output = sliceHex(input, 1, 2)
    expect(output).toBe('00')
  })
})

describe('utils > hasOwn', () => {
  it('should check if object has own property', () => {
    const input = { a: 1, b: 2 }
    const output = hasOwn(input, 'a')
    expect(output).toBe(true)
  })

  it('should check if object has not own property', () => {
    const input = { a: 1, b: 2 }
    const output = hasOwn(input, 'c')
    expect(output).toBe(false)
  })
})
