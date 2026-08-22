import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, it, expect } from 'vitest'
import { findSupport, findSupportByType } from '../src/find-support.js'
import { readValidImage } from './helper.js'

describe(findSupportByType, () => {
  it('should find support by bmp', async () => {
    const img = await readValidImage('bmp/sample.bmp')
    expect(findSupportByType(img, 'bmp')).toBeDefined()
  })

  it('should find support by cur', async () => {
    const img = await readValidImage('cur/sample.cur')
    expect(findSupportByType(img, 'cur')).toBeDefined()
  })

  it('should find support by icns', async () => {
    const img = await readValidImage('icns/sample.icns')
    expect(findSupportByType(img, 'icns')?.type).toBe('icns')
  })
})

describe(findSupport, async () => {
  const cwd = path.resolve(import.meta.dirname, 'images/valid')
  const files = fs.glob('**/*', { cwd })

  for await (const file of files) {
    if (!(await fs.stat(path.join(cwd, file))).isFile()) {
      continue
    }
    if (file.endsWith('.md')) {
      continue
    }
    it(`should find support by ${file}`, async () => {
      const img = await readValidImage(file)
      expect(findSupport(img)).toBeDefined()
    })
  }
})
