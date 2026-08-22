# Repository Guidelines

## Project Overview

`tiny-image-size` is a zero-dependency TypeScript library that detects image type and dimensions (`width`, `height`) from raw bytes. Supports 20 formats: bmp, cur, dds, gif, heif, icns, ico, j2c, jp2, jpg, jxl, jxl-stream, ktx, png, pnm, psd, svg, tga, tiff, webp. ESM-only, published as a single bundled `dist/index.js` + `dist/index.d.ts`.

## Architecture & Data Flow

Plugin model via tuple registry. Data flow: `Uint8Array` → type validator (magic/header check) → size extractor → `{ width, height, type }`.

- **`src/types.ts`** — shared types. `ImageSupport = readonly [SupportedImageType, ImageTypeValidator, ImageSizeExtractor]` is the plugin contract: a `[type, isType, typeSize]` tuple.
- **`src/supports/<fmt>.ts`** — one module per format. Each exports `is<Fmt>: ImageTypeValidator`, `<fmt>Size: ImageSizeExtractor`, and a ready tuple (e.g. `png: ImageSupport = ['png', isPng, pngSize]`).
- **`src/supports/index.ts`** — registry: aggregates all 20 tuples into `supports: ImageSupport[]` (ordered, linear-scan fallback) and `supportsMap: ImageSupportMap` (O(1) lookup by type).
- **`src/find-support.ts`** — `findSupport(input)` fast-paths on first byte via `fastCheckMap` (e.g. `0x89` → png, `0xff` → jpg, `0x49/0x4d` → tiff), falls back to linear validator scan; `findSupportByType(input, type)`.
- **`src/image-size.ts`** — public entry `tinyImageSize(input: Uint8Array, type?: SupportedImageType): ImageSizeResult | null`. Returns `null` for empty/`< 2`-byte input; otherwise `{ ...extractor(input), type }`.
- **`src/utils.ts`** — shared byte readers. All numeric reads wrap a zero-copy `DataView` over the input buffer; **big-endian by default**, pass `littleEndian: true` explicitly (tiff derives endianness from `MM`/`II` signature). Helpers: `slice`, `sliceHex`, `int16`, `uint16`, `uint24LE`, `int32`, `uint32`, `uint64` (bigint), `hasOwn`, `findBox` (+ `ImageBox {name, offset, size}`), `createBitReader(input, littleEndian?)` → `ReadBits(length?)` (throws `Error('Reached end of input')` on truncation).

Cross-module reuse is the norm: `cur.ts` reuses ico's `isIcoLike`/`icoSize`, `jxl.ts` delegates to `jxlStreamSize` after extracting jxlc/jxlp boxes.

**Adding a format** (the standard pattern): 1) add `src/supports/<fmt>.ts` exporting `is<Fmt>`, `<fmt>Size`, tuple; 2) extend the `SupportedImageType` union in `src/types.ts`; 3) register in `src/supports/index.ts`; 4) add `tests/supports.<fmt>.spec.ts` + fixtures under `tests/images/valid/<fmt>/`; 5) rebuild `dist/` (see below).

## Key Directories

- **`src/`** — library source. `index.ts` (public entry, named + default export), `image-size.ts`, `find-support.ts`, `types.ts`, `utils.ts`, `supports/` (one file per format).
- **`tests/`** — Vitest specs + `helper.ts` + fixture images.
- **`tests/images/valid/<fmt>/`** — per-format fixtures; `tests/images/invalid/` — malformed fixtures (flat).
- **`dist/`** — build output (gitignored). Single minified ESM bundle + bundled d.ts.
- **`coverage/`** — v8 coverage output (gitignored).

## Development Commands

```bash
pnpm install        # pnpm@11.22.0 (packageManager field)
pnpm build          # tsdown → dist/index.js + dist/index.d.ts
pnpm test           # vitest --coverage (v8, always on)
pnpm lint           # oxlint . --type-check --type-aware && oxfmt . --check
pnpm format         # oxlint --fix + oxfmt . (auto-fix)
pnpm release        # bumpp version bump + publish
```

Pre-commit hooks (simple-git-hooks + nano-staged): lint, format, and `vitest related --run` for changed files. **`dist/` is gitignored and can go stale** — after any `src/` change, run `pnpm build` before shipping; the committed state currently lags `src/supports/tiff.ts` (magic check differs).

## Code Conventions & Common Patterns

- **ESM with explicit extensions**: imports use `.js` suffixes (`from './types.js'`); `verbatimModuleSyntax`, `moduleResolution: bundler`, strict + `noUncheckedIndexedAccess` (hence deliberate `!` non-null assertions).
- **Exports**: named exports only; `src/index.ts` is the sole default export (plus named `tinyImageSize`).
- **Naming**: camelCase functions, `UPPER_SNAKE` constants, kebab-case files, `is<Fmt>` / `<fmt>Size` / tuple named after the format. Tests: `supports.<fmt>.spec.ts`, `utils.<name>.spec.ts`.
- **Error handling**: no exported error classes. Plain `Error` for undetermined/unsupported type (`'Cannot determine image type'`, `'Type X is not supported'`) and JXL/bit-reader truncation; `TypeError('Invalid <FMT> …')` for structurally invalid files (`'Invalid PNG'`, `'Invalid Tiff. Missing tags'`, `'Invalid WebP'`, `'Invalid SVG'`, `'Invalid HEIF, no ipco/ispe box found'`). Empty/`< 2`-byte input → `null`, never thrown. Validators may throw — `tinyImageSize` does not catch.
- **Formatting** (oxfmt via `@pengzhanbo/oxc-config`): single quotes, **no semicolons**, trailing commas, 2-space indent, arrow parens always, imports sorted (type-first), `sortPackageJson` on. `.vscode/settings.json` sets oxc-vscode as default formatter with format-on-save; `source.organizeImports: never` (oxfmt owns import order).
- **Linting** (oxlint, type-aware/type-checked): correctness errors, pedantic/perf/restriction/suspicious warnings, vitest-aware. Use `/* v8 ignore … */` comments (e.g. `-- @preserve`) for uncovered branches, matching existing usage.
- **JSDoc**: bilingual EN/中文 comments; inline hex/char comments on magic numbers.
- **Parsers**: byte-wise, allocation-light (the only repeated allocation pattern is `input.slice(...)` in jpg/tiff/svg); box-walking formats use `findBox`; bit-level formats use `createBitReader`; svg is regex-based after full decode via `slice(input)`.

## Important Files

| File                                                  | Purpose                                                                                                                    |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                                        | ESM, `files: ["dist"]`, exports `.` → `./dist/index.js`; scripts above; devDeps only                                       |
| `tsconfig.json`                                       | extends `@pengzhanbo/tsconfig` (lib flavor); strict, `isolatedDeclarations`, includes `src` + `tests/supports.jxl.spec.ts` |
| `tsconfig.node.json`                                  | covers `tsdown.config.ts` only (composite)                                                                                 |
| `tsdown.config.ts`                                    | entry `src/index.ts`, `format: 'esm'`, `dts: true`, comment-stripping + oxfmt on success                                   |
| `vitest.config.ts`                                    | include `**/*.spec.[tj]s`, v8 coverage (text/clover/json), `TZ=Etc/UTC`                                                    |
| `src/index.ts`, `src/image-size.ts`                   | public API                                                                                                                 |
| `src/types.ts`, `src/find-support.ts`, `src/utils.ts` | shared contracts and byte helpers                                                                                          |
| `src/supports/index.ts`                               | format registry (edit when adding a format)                                                                                |

## Runtime/Tooling Preferences

- **Package manager**: pnpm (lockfile `pnpm-lock.yaml`, `packageManager: pnpm@11.22.0`). `pnpm-workspace.yaml` is not a workspace (builds-allow + shell emulator only).
- **Runtime**: Node; no `engines` field, but tooling requires Node ≥ 20.19 (oxlint/oxfmt), ≥ 22.18 (tsdown/bumpp), ≥ 20 (vitest 4). TypeScript 7 native preview; Vitest 4 (Vite 8).
- **No linter/formatter config in `package.json`**: oxlint + oxfmt, both configured via factory calls from `@pengzhanbo/oxc-config` (`oxlint.config.ts`, `oxfmt.config.ts`) — no ESLint/Prettier, don't add them.
- **Formatting rules are enforced by hooks/CI-side checks**, not by editing: run `pnpm format` if unsure.

## Testing & QA

- **Framework**: Vitest; `describe`/`it`/`expect` imported per file (no globals); `import.meta.dirname` for paths; no `it.each` — the only dynamic test is a `for await` loop in `findSupport.spec.ts` that globs every file under `tests/images/valid/` and asserts `findSupport(img)` is defined.
- **Fixtures**: load via `tests/helper.ts` — `readValidImage('bmp/sample.bmp')` (relative to `images/valid`), `readInvalidImage('sample.png')`, plus `getValidImagesPath`/`getInvalidImagesPath`. Reads are async and capped at 512 KiB. For crafted edge-case inputs, build bytes from hex segments: `bytesFromHex(hexStr('00000014', '66747970', …))` (variadic hex-join helper; avoids `prefer-template` lint). Canonical fixture size is **123×456**; the standard assertion is `expect(xSize(img)).toEqual({ width: 123, height: 456 })`. Validator tests: `expect(isX(img)).toBe(true)`. Error tests use `toThrow(...)`, e.g. `/Reached end of input/`. Synthetic edge-case tests (crafted byte arrays) live inline in the specs; only real-format fixtures (e.g. `j2c/sample.j2c`) are added under `tests/images/valid/<fmt>/`.
- **Coverage**: v8 provider, always enabled, no thresholds; suite is at 100% stmts/branch/funcs/lines. Helper file is v8-ignored via `/* v8 ignore file -- @preserve */`; genuinely unreachable code uses `/* v8 ignore next -- @preserve */` (see `readTagValue`'s `default` arm in `src/supports/tiff.ts`).
