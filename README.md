# tiny-image-size

English | [简体中文](./README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/tiny-image-size?style=flat-square)](https://www.npmjs.com/package/tiny-image-size)
![npm download](https://img.shields.io/npm/dm/tiny-image-size?style=flat-square)
![npm license](https://img.shields.io/npm/l/tiny-image-size?style=flat-square)
[![codecov](https://codecov.io/gh/pengzhanbo/tiny-image-size/graph/badge.svg?token=07CV6YGT4Q)](https://codecov.io/gh/pengzhanbo/tiny-image-size)

A zero-dependency TypeScript library that detects image type and dimensions (width/height) **by parsing only the header bytes of the image**, without downloading or decoding the entire file.

## Key Highlights

- **Header-only parsing** — the library reads only the file signature and the metadata block that carries the size, so it does not need the full image data
- **Streaming-friendly** — since only the first few dozen bytes are required, dimensions can be resolved from a partial file or a partial network response, with bounded memory and near-zero network bandwidth
- Zero dependencies, single ESM bundle (~10 KB, including type declarations)
- Fully typed with TypeScript
- Runs in any JavaScript runtime (Node.js, Bun, Deno, browser, etc.)
- Automatic type detection, or pass an explicit type to skip detection
- Supports 20 common image formats:
  `bmp` · `cur` · `dds` · `gif` · `heif` · `icns` · `ico` · `j2c` · `jp2` · `jpg` · `jxl` · `jxl-stream` · `ktx` · `png` · `pnm` · `psd` · `svg` · `tga` · `tiff` · `webp`

## How It Works

For every supported format, the `width`/`height` values live in a tiny number of bytes at the start of the file:

1. `tiny-image-size` reads the **magic signature** to detect the image type.
2. It then walks the corresponding **header/metadata structure** (e.g. PNG IHDR, JPEG SOF, GIF logical screen descriptor, WebP VP8/VP8L header, TIFF IFD, …) and extracts the dimensions.

It does not decode pixel data and does not need to buffer the whole image. This is what makes it cheap to call on a streaming or partial input, and it is the recommended way to get `thumbnail-width × thumbnail-height`-style metadata at the edge (e.g. in an API server or a CDN worker).

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

## Streaming Examples

Since only the header is needed, you do not have to assume a fixed header size. Use an **incremental** strategy: every time a chunk arrives, call `tinyImageSize` — if it returns `null` or throws, the data is not enough yet, so keep reading; as soon as a size is returned, return immediately. This resolves the dimensions with the minimum amount of data, as fast as possible.

### Local image — read and retry, stop as soon as the size is resolved

```ts
import { createReadStream } from 'node:fs'
import { tinyImageSize } from 'tiny-image-size'

async function getLocalImageSize(filePath: string) {
  const chunks: Uint8Array[] = []

  // `tinyImageSize` returns null or throws when there is not enough data,
  // either way we keep reading
  for await (const chunk of createReadStream(filePath)) {
    chunks.push(chunk)
    try {
      const size = tinyImageSize(new Uint8Array(Buffer.concat(chunks)))
      if (size) return size
    } catch {
      // not enough data yet — read the next chunk
    }
  }
  return null // reached EOF without a size (corrupted file, or not an image)
}
```

### Remote image — retry as the response data arrives

```ts
import { tinyImageSize } from 'tiny-image-size'

async function getRemoteImageSize(url: string) {
  const res = await fetch(url)
  if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`)

  const chunks: Uint8Array[] = []

  // Returning early from this loop cancels the remaining download
  for await (const chunk of res.body) {
    chunks.push(chunk)
    try {
      const size = tinyImageSize(new Uint8Array(Buffer.concat(chunks)))
      if (size) return size
    } catch {
      // not enough data yet — read the next chunk
    }
  }
  return null // response ended without a size
}
```

## API

### `tinyImageSize(input, type?)`

| Param   | Type                 | Description                                          |
| ------- | -------------------- | ---------------------------------------------------- |
| `input` | `Uint8Array`         | Raw image bytes (a header-only prefix is sufficient) |
| `type`  | `SupportedImageType` | Optional. Explicit image type, skips auto-detection  |

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
