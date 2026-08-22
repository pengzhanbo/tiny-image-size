import { describe, it, expect } from 'vitest'
import { createBitReader } from '../src/utils.js'

describe('utils > createBitReader > big endian', () => {
  it('should read single bits correctly', () => {
    const input = new Uint8Array([0xff, 0xff, 0b10101010, 0b11001100])
    const reader = createBitReader(input)

    expect(reader()).toBe(1)
    expect(reader()).toBe(0)
    expect(reader()).toBe(1)
    expect(reader()).toBe(0)
  })

  it('should read multiple bits correctly', () => {
    const input = new Uint8Array([0xff, 0xff, 0b10101010, 0b11001100])
    const reader = createBitReader(input)

    expect(reader(3)).toBe(0b101)
    expect(reader(5)).toBe(0b01010)
    expect(reader(8)).toBe(0b11001100)
  })

  it('should handle reading across byte boundaries', () => {
    const input = new Uint8Array([0xff, 0xff, 0b10101010, 0b11001100, 0b00110011])
    const reader = createBitReader(input)

    expect(reader(12)).toBe(0b101010101100)
    expect(reader(12)).toBe(0b110000110011)
  })

  it('should throw an error when reaching end of input', () => {
    const input = new Uint8Array([0b10101010])
    const reader = createBitReader(input)

    expect(() => reader(9)).toThrow(/Reached end of input/)
  })
})

describe('utils > createBitReader > little endian', () => {
  it('should read single bits correctly', () => {
    const input = new Uint8Array([0xff, 0xff, 0b10101010, 0b11001100])
    const reader = createBitReader(input, true)

    expect(reader()).toBe(0)
    expect(reader()).toBe(1)
    expect(reader()).toBe(0)
    expect(reader()).toBe(1)
  })

  it('should read multiple bits correctly', () => {
    const input = new Uint8Array([0xff, 0xff, 0b10101010, 0b11001100])
    const reader = createBitReader(input, true)

    expect(reader(3)).toBe(0b010)
    expect(reader(5)).toBe(0b10101)
    expect(reader(8)).toBe(0b11001100)
  })

  it('should handle reading across byte boundaries', () => {
    const input = new Uint8Array([0xff, 0xff, 0b10101010, 0b11001100, 0b00110011])
    const reader = createBitReader(input, true)

    expect(reader(12)).toBe(0b110010101010)
    expect(reader(12)).toBe(0b001100111100)
  })

  it('should throw an error when reaching end of input', () => {
    const input = new Uint8Array([0b10101010])
    const reader = createBitReader(input, true)

    expect(() => reader(9)).toThrow(/Reached end of input/)
  })
})

describe('utils > createBitReader > byte offset handling', () => {
  it('should start reading from the third byte by default', () => {
    const input = new Uint8Array([0xff, 0xff, 0b10101010, 0b11001100])
    const reader = createBitReader(input)

    expect(reader(8)).toBe(0b10101010)
  })
})

describe('utils > createBitReader > edge cases', () => {
  it('should handle reading 0 bits', () => {
    const input = new Uint8Array([0b10101010])
    const reader = createBitReader(input)
    expect(reader(0)).toBe(0)
  })

  it('should handle reading all bits from input', () => {
    const input = new Uint8Array([0xff, 0xff, 0b10101010, 0b11001100])
    const reader = createBitReader(input)
    expect(reader(16)).toBe(0b1010101011001100)
    expect(() => reader(1)).toThrow(/Reached end of input/)
  })

  it('should handle reading bits at byte boundary', () => {
    const input = new Uint8Array([0xff, 0xff, 0b10101010, 0b11001100])
    const reader = createBitReader(input)
    expect(reader(8)).toBe(0b10101010)
    expect(reader(8)).toBe(0b11001100)
  })

  it('should handle reading bits across multiple bytes', () => {
    const input = new Uint8Array([0xff, 0xff, 0b10101010, 0b11001100, 0b00110011])
    const reader = createBitReader(input)
    expect(reader(20)).toBe(0b10101010110011000011)
  })

  it('should handle alternating between small and large bit reads', () => {
    const input = new Uint8Array([0xff, 0xff, 0b10101010, 0b11001100, 0b00110011])
    const reader = createBitReader(input)
    expect(reader(3)).toBe(0b101)
    expect(reader(10)).toBe(0b0101011001)
    expect(reader(2)).toBe(0b10)
    expect(reader(9)).toBe(0b000110011)
  })
})
