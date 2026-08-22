/* v8 ignore file -- @preserve */

import fs from 'node:fs'
import path from 'node:path'

export function getValidImagesPath(filename: string): string {
  return path.join(import.meta.dirname, 'images', 'valid', filename)
}

export function getInvalidImagesPath(filename: string): string {
  return path.join(import.meta.dirname, 'images', 'invalid', filename)
}

export function bytesFromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

export function hexStr(...parts: string[]): string {
  return parts.join('')
}

export async function readImageFile(filepath: string): Promise<Uint8Array> {
  let handle: fs.promises.FileHandle
  try {
    handle = await fs.promises.open(filepath, 'r')
  } catch (e) {
    throw e as Error
  }

  try {
    const { size } = await handle.stat()
    if (size <= 0) {
      throw new Error('Empty file size')
    }
    const inputSize = Math.min(size, 512 * 1024)
    const input = new Uint8Array(inputSize)
    await handle.read(input, 0, inputSize, 0)

    return input
  } catch (e) {
    throw e as Error
  } finally {
    await handle.close()
  }
}

export async function readValidImage(filename: string): Promise<Uint8Array> {
  return readImageFile(getValidImagesPath(filename))
}

export async function readInvalidImage(filename: string): Promise<Uint8Array> {
  return readImageFile(getInvalidImagesPath(filename))
}
