import type { ImageSizeResult, SupportedImageType } from './types.js'
import { findSupport, findSupportByType } from './find-support.js'

/**
 * Get image size from buffer
 *
 *
 * @param input Image buffer
 * @param type Image type
 * @returns Image size result or null if buffer is empty
 *
 * @throws {Error} Error if image type cannot be determined
 * @throws {TypeError} TypeError if image type is not supported
 *
 */
export function tinyImageSize(
  input: Uint8Array,
  type?: SupportedImageType,
): ImageSizeResult | null {
  if (!input || input.length < 2) {
    return null
  }

  if (type) {
    const support = findSupportByType(input, type)
    if (!support) {
      throw new Error(`Type ${type} is not supported`)
    }
    return { ...support.extractor(input), type }
  }

  const support = findSupport(input)
  if (!support) {
    throw new Error('Cannot determine image type')
  }
  return { ...support.extractor(input), type: support.type }
}
