export type SupportedImageType =
  | 'bmp'
  | 'cur'
  | 'dds'
  | 'gif'
  | 'heif'
  | 'icns'
  | 'ico'
  | 'j2c'
  | 'jp2'
  | 'jpg'
  | 'jxl'
  | 'jxl-stream'
  | 'ktx'
  | 'png'
  | 'pnm'
  | 'psd'
  | 'svg'
  | 'tga'
  | 'tiff'
  | 'webp'

export interface ImageSizeResult {
  /**
   * Image width
   */
  width: number
  /**
   * Image height
   */
  height: number
  /**
   * Image type
   */
  type: SupportedImageType
}

export type ImageTypeValidator = (input: Uint8Array) => boolean

export type ImageSizeExtractor = (input: Uint8Array) => Pick<ImageSizeResult, 'width' | 'height'>

export type ImageSupport = readonly [SupportedImageType, ImageTypeValidator, ImageSizeExtractor]

export type ImageSupportMap = Map<
  SupportedImageType,
  readonly [ImageTypeValidator, ImageSizeExtractor]
>
