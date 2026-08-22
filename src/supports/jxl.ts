import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { slice, findBox } from '../utils.js'
import { jxlStreamSize } from './jxl-stream.js'

function extractPartialStreams(input: Uint8Array): Uint8Array[] {
  const partialStreams: Uint8Array[] = []
  let offset = 0
  while (offset < input.length) {
    const jxlpBox = findBox(input, 'jxlp', offset)
    if (!jxlpBox) {
      break
    }
    partialStreams.push(input.slice(jxlpBox.offset + 12, jxlpBox.offset + jxlpBox.size))
    offset = jxlpBox.offset + jxlpBox.size
  }
  return partialStreams
}

function concatenateCodeStreams(partialCodeStreams: Uint8Array[]): Uint8Array {
  const totalLength = partialCodeStreams.reduce((acc, curr) => acc + curr.length, 0)
  const codestream = new Uint8Array(totalLength)
  let position = 0
  for (const partial of partialCodeStreams) {
    codestream.set(partial, position)
    position += partial.length
  }
  return codestream
}

function extractCodeStream(input: Uint8Array): Uint8Array | undefined {
  const jxlcBox = findBox(input, 'jxlc', 0)
  if (jxlcBox) {
    return input.slice(jxlcBox.offset + 8, jxlcBox.offset + jxlcBox.size)
  }

  const partialStreams = extractPartialStreams(input)
  if (partialStreams.length > 0) {
    return concatenateCodeStreams(partialStreams)
  }
}

export const isJxl: ImageTypeValidator = (input) => {
  const boxType = slice(input, 4, 8)
  if (boxType !== 'JXL ') {
    return false
  }
  const ftypBox = findBox(input, 'ftyp', 0)
  if (!ftypBox) {
    return false
  }
  const brand = slice(input, ftypBox.offset + 8, ftypBox.offset + 12)
  return brand === 'jxl '
}

export const jxlSize: ImageSizeExtractor = (input) => {
  const codestream = extractCodeStream(input)
  if (!codestream) {
    throw new Error('No codestream found in JXL container')
  }
  return jxlStreamSize(codestream)
}

export const jxl: ImageSupport = ['jxl', isJxl, jxlSize]
