import type { ImageSupportMap, ImageSupport } from '../types.js'
import { bmp } from './bmp.js'
import { cur } from './cur.js'
import { dds } from './dds.js'
import { gif } from './gif.js'
import { heif } from './heif.js'
import { icns } from './icns.js'
import { ico } from './ico.js'
import { j2c } from './j2c.js'
import { jp2 } from './jp2.js'
import { jpg } from './jpg.js'
import { jxlStream } from './jxl-stream.js'
import { jxl } from './jxl.js'
import { ktx } from './ktx.js'
import { png } from './png.js'
import { pnm } from './pnm.js'
import { psd } from './psd.js'
import { svg } from './svg.js'
import { tga } from './tga.js'
import { tiff } from './tiff.js'
import { webp } from './webp.js'

export const supports: ImageSupport[] = [
  bmp,
  cur,
  dds,
  gif,
  heif,
  icns,
  ico,
  j2c,
  jp2,
  jpg,
  jxlStream,
  jxl,
  ktx,
  png,
  pnm,
  psd,
  svg,
  tga,
  tiff,
  webp,
]

export const supportsMap: ImageSupportMap = new Map(supports.map(([type, ...rest]) => [type, rest]))
