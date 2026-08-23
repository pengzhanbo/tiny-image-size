# tiny-image-size

English | [简体中文](./README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/tiny-image-size?style=flat-square)](https://www.npmjs.com/package/tiny-image-size)
![npm download](https://img.shields.io/npm/dm/tiny-image-size?style=flat-square)
![npm license](https://img.shields.io/npm/l/tiny-image-size?style=flat-square)
[![codecov](https://codecov.io/gh/pengzhanbo/tiny-image-size/graph/badge.svg?token=07CV6YGT4Q)](https://codecov.io/gh/pengzhanbo/tiny-image-size)

A zero-dependency TypeScript library that detects image type and dimensions (width/height) directly from raw bytes (`Uint8Array`). No runtime dependencies, works out of the box.

## Features

- Zero dependencies, single ESM bundle (~10 KB, including type declarations)
- Fully typed with TypeScript
- Any JavaScript Runtime Environment (Node.js, Bun, Deno, Browser, etc.)
- Automatic type detection, or pass an explicit type to skip detection
- Supports 20 common image formats:
  `bmp` · `cur` · `dds` · `gif` · `heif` · `icns` · `ico` · `j2c` · `jp2` · `jpg` · `jxl` · `jxl-stream` · `ktx` · `png` · `pnm` · `psd` · `svg` · `tga` · `tiff` · `webp`

## Install

```bash
pnpm add tiny-image-size
# or
npm install tiny-image-size
```

## Usage

```ts
import { readFileSync } from 'node:fs'
import { tinyImageSize } from 'tiny-image-size'

const input = readFileSync('image.png')
const size = tinyImageSize(input)

// size: { width: 123, height: 456, type: 'png' } | null
```

A default import is also supported:

```ts
import tinyImageSize from 'tiny-image-size'
```

In browsers, pass `new Uint8Array(arrayBuffer)` directly.

## API

### `tinyImageSize(input, type?)`

| Param   | Type                 | Description                                         |
| ------- | -------------------- | --------------------------------------------------- |
| `input` | `Uint8Array`         | Raw image bytes                                     |
| `type`  | `SupportedImageType` | Optional. Explicit image type, skips auto-detection |

**Returns** `ImageSizeResult | null`:

```ts
interface ImageSizeResult {
  width: number
  height: number
  type: SupportedImageType // union of the 20 formats above
}
```

Returns `null` when the input is empty or shorter than 2 bytes.

**Errors**:

- Throws `Error('Cannot determine image type')` when the type cannot be determined
- Throws `Error('Type X is not supported')` when `type` is not a supported format
- Throws `TypeError` for structurally invalid files (e.g. `'Invalid PNG'`, `'Invalid WebP'`)

## License

MIT
