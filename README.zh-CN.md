# tiny-image-size

[English](./README.md) | 简体中文

[![npm version](https://img.shields.io/npm/v/tiny-image-size?style=flat-square)](https://www.npmjs.com/package/tiny-image-size)
![npm download](https://img.shields.io/npm/dm/tiny-image-size?style=flat-square)
![npm license](https://img.shields.io/npm/l/tiny-image-size?style=flat-square)
[![codecov](https://codecov.io/gh/pengzhanbo/tiny-image-size/graph/badge.svg?token=07CV6YGT4Q)](https://codecov.io/gh/pengzhanbo/tiny-image-size)

零依赖的 TypeScript 图像尺寸检测库 —— **仅解析图像文件头字节**即可识别图像类型并解析宽高，无需下载或解码完整图片。

## 核心特性

- **仅解析文件头** —— 只需读取文件签名与携带尺寸信息的元数据块，无需依赖完整图像数据
- **流式友好** —— 只需图片开头的少量字节即可解析出尺寸，可基于文件的部分读取或网络响应的部分数据完成解析，内存占用有界，网络带宽消耗近乎为零
- 零依赖，单一 ESM 产物（约 10 KB，含类型声明）
- 完整 TypeScript 类型支持
- 支持任何 JavaScript 运行环境（Node.js、Bun、Deno、浏览器等）
- 支持自动检测类型，也可显式指定类型以跳过检测
- 支持 20 种常见图像格式：
  `bmp` · `cur` · `dds` · `gif` · `heif` · `icns` · `ico` · `j2c` · `jp2` · `jpg` · `jxl` · `jxl-stream` · `ktx` · `png` · `pnm` · `psd` · `svg` · `tga` · `tiff` · `webp`

## 工作原理

对于所有受支持的格式，`width` / `height` 都位于文件开头的极少量字节中：

1. `tiny-image-size` 读取**魔数签名**以识别图像类型。
2. 随后遍历对应的**头部/元数据结构**（如 PNG IHDR、JPEG SOF、GIF 逻辑屏幕描述符、WebP VP8/VP8L 头、TIFF IFD 等）并提取尺寸。

它不会解码像素数据，也无需缓冲整张图片。因此，在流式或部分输入上调用它成本极低，是获取缩略图式元数据（如 API 服务或 CDN Worker 中）的推荐方式。

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

## 流式示例

由于只需文件头即可解析，你无需预设固定的头部大小。推荐采用"**边读边试**"策略：每收到一段数据就调用一次 `tinyImageSize`，若返回 `null` 或抛出异常，说明数据尚不足，继续读取下一段；一旦拿到尺寸立即返回，以最少的数据量、最快的速度完成解析。

### 本地图片：边读边试，拿到尺寸即停止

```ts
import { createReadStream } from 'node:fs'
import { tinyImageSize } from 'tiny-image-size'

async function getLocalImageSize(filePath: string) {
  const chunks: Uint8Array[] = []

  // 数据不足时 tinyImageSize 返回 null 或抛错，均视为继续读取
  for await (const chunk of createReadStream(filePath)) {
    chunks.push(chunk)
    try {
      const size = tinyImageSize(new Uint8Array(Buffer.concat(chunks)))
      if (size) return size
    } catch {
      // 数据不足，继续读取下一段
    }
  }
  return null // 读到文件末尾仍未解析出尺寸（如文件损坏或非图像）
}
```

### 远程图片：随响应数据到达，边下边试

```ts
import { tinyImageSize } from 'tiny-image-size'

async function getRemoteImageSize(url: string) {
  const res = await fetch(url)
  if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`)

  const chunks: Uint8Array[] = []

  // 提前 return 时会自动取消剩余的下载
  for await (const chunk of res.body) {
    chunks.push(chunk)
    try {
      const size = tinyImageSize(new Uint8Array(Buffer.concat(chunks)))
      if (size) return size
    } catch {
      // 数据不足，继续读取下一段
    }
  }
  return null // 响应结束仍未解析出尺寸
}
```

## API

### `tinyImageSize(input, type?)`

| 参数    | 类型                 | 说明                                   |
| ------- | -------------------- | -------------------------------------- |
| `input` | `Uint8Array`         | 图像原始字节（仅包含文件头的前缀即可） |
| `type`  | `SupportedImageType` | 可选，显式指定图像类型，跳过自动检测   |

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
