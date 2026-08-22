import type { ImageSupport, ImageTypeValidator, ImageSizeExtractor } from '../types.js'
import { isIcoLike, icoSize } from './ico.js'

export const isCur: ImageTypeValidator = (input) => isIcoLike(input, 2)

export const curSize: ImageSizeExtractor = icoSize

export const cur: ImageSupport = ['cur', isCur, curSize]
