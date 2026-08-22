import type { ImageSizeExtractor, SupportedImageType } from './types.js'
import { supportsMap, supports } from './supports/index.js'

/**
 * Quickly determine image type by file header
 *
 * 通过文件头快速判断图片类型
 */
const fastCheckMap = new Map<number, SupportedImageType>([
  [0x00, 'heif'],
  [0x38, 'psd'],
  [0x42, 'bmp'],
  [0x44, 'dds'],
  [0x47, 'gif'],
  [0x49, 'tiff'],
  [0x4d, 'tiff'],
  [0x52, 'webp'],
  [0x69, 'icns'],
  [0x89, 'png'],
  [0xff, 'jpg'],
])

interface Support {
  type: SupportedImageType
  extractor: ImageSizeExtractor
}

/**
 * Find support by image type
 *
 * 根据图片类型查找支持
 *
 * @param input Image file content
 * @param type Image type
 * @returns Support, if cannot determine, return undefined
 */
export function findSupportByType(
  input: Uint8Array,
  type: SupportedImageType,
): Support | undefined {
  const support = supportsMap.get(type)
  if (support?.[0](input)) {
    return { type, extractor: support[1] }
  }
}

/**
 * Get image type by file header
 *
 * 通过文件头获取图片类型
 *
 * @param input Image file content
 * @returns Image type, if cannot determine, return undefined
 */
export function findSupport(input: Uint8Array): Support | undefined {
  const maybeType = fastCheckMap.get(input[0]!)
  const support = maybeType && findSupportByType(input, maybeType)
  if (support) {
    return support
  }

  for (const [type, validator, extractor] of supports) {
    if (validator(input)) {
      return { type, extractor }
    }
  }
}
