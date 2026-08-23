# tiny-image-size

[English](./README.md) | 简体中文

[![npm version](https://img.shields.io/npm/v/tiny-image-size?style=flat-square)](https://www.npmjs.com/package/tiny-image-size)
![npm download](https://img.shields.io/npm/dm/tiny-image-size?style=flat-square)
![npm license](https://img.shields.io/npm/l/tiny-image-size?style=flat-square)
[![codecov](https://codecov.io/gh/pengzhanbo/tiny-image-size/graph/badge.svg?token=07CV6YGT4Q)](https://codecov.io/gh/pengzhanbo/tiny-image-size)

零依赖的 TypeScript 图像尺寸检测库 —— 从原始字节（`Uint8Array`）中识别图像类型并解析宽高，开箱即用，无任何运行时依赖。

## 特性

- 零依赖，单一 ESM 产物（约 10 KB，含类型声明）
- 完整 TypeScript 类型支持
- 支持任何 JavaScript 运行环境（Node.js、Bun、Deno、浏览器等）
- 支持自动检测类型，也可显式指定类型以跳过检测
- 支持 20 种常见图像格式：
  `bmp` · `cur` · `dds` · `gif` · `heif` · `icns` · `ico` · `j2c` · `jp2` · `jpg` · `jxl` · `jxl-stream` · `ktx` · `png` · `pnm` · `psd` · `svg` · `tga` · `tiff` · `webp`

## 安装

```bash
pnpm add tiny-image-size
# 或
npm install tiny-image-size
```

## 使用

```ts
import { readFileSync } from 'node:fs'
import { tinyImageSize } from 'tiny-image-size'

const input = readFileSync('image.png')
const size = tinyImageSize(input)

// size: { width: 123, height: 456, type: 'png' } | null
```

也支持默认导入：

```ts
import tinyImageSize from 'tiny-image-size'
```

浏览器中可直接传入 `new Uint8Array(arrayBuffer)`。

## API

### `tinyImageSize(input, type?)`

| 参数    | 类型                 | 说明                                 |
| ------- | -------------------- | ------------------------------------ |
| `input` | `Uint8Array`         | 图像原始字节                         |
| `type`  | `SupportedImageType` | 可选，显式指定图像类型，跳过自动检测 |

**返回** `ImageSizeResult | null`：

```ts
interface ImageSizeResult {
  width: number
  height: number
  type: SupportedImageType // 上述 20 种格式的联合类型
}
```

输入为空或少于 2 字节时返回 `null`。

**异常**：

- 无法识别图像类型时抛出 `Error('Cannot determine image type')`
- `type` 参数指定了不支持的格式时抛出 `Error('Type X is not supported')`
- 文件结构损坏时抛出 `TypeError`（如 `'Invalid PNG'`、`'Invalid WebP'`）

## License

MIT
