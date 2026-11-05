import { describe, expect, it } from '@jest/globals'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const jestRequire = createRequire(require.resolve('jest-config'))
const coverageRequire = createRequire(require.resolve('test-exclude'))
type MergeOptions = {
  arrayMerge?: (target: unknown[], source: unknown[]) => unknown[]
  customMerge?: (key: string) => (target: unknown, source: unknown) => unknown
}
const merge: {
  (
    target: object,
    source: object,
    options?: MergeOptions
  ): Record<string, unknown>
  all(objects: object[]): object
} = jestRequire('deepmerge')
const { glob, globSync }: typeof import('glob') = require('glob')
const { minimatch }: { minimatch(file: string, pattern: string): boolean } =
  coverageRequire('minimatch')
const TestExclude: new (options: {
  cwd: string
  include: string[]
  exclude: string[]
  extension: string[]
}) => {
  globSync(): string[]
  glob(): Promise<string[]>
} = require('test-exclude')

describe('dependency overrides', () => {
  it('preserves deepmerge arrays, nested objects, and all()', () => {
    expect(
      merge.all([
        { nested: { first: true }, items: [1] },
        { nested: { second: true }, items: [2] }
      ])
    ).toEqual({
      nested: { first: true, second: true },
      items: [1, 2]
    })
  })

  it('preserves custom array merging', () => {
    expect(
      merge(
        { items: [1] },
        { items: [2] },
        { arrayMerge: (_, source) => source }
      )
    ).toEqual({ items: [2] })
  })

  it('preserves custom property merging', () => {
    expect(
      merge(
        { nested: { first: true } },
        { nested: { second: true } },
        { customMerge: () => (_, source) => source }
      )
    ).toEqual({ nested: { second: true } })
  })

  it('does not poison the result prototype from either merge argument', () => {
    const poisoned = JSON.parse('{"__proto__":{"polluted":true}}')

    for (const result of [merge({}, poisoned), merge(poisoned, {})]) {
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype)
      expect(result.polluted).toBeUndefined()
      expect(Object.hasOwn(result, '__proto__')).toBe(false)
    }
  })

  it('preserves synchronous and asynchronous glob discovery', async () => {
    const options = { cwd: process.cwd(), nodir: true }
    const files = globSync('src/**/*.ts', options).sort()

    expect(files).toContain('src/main/index.ts')
    expect(
      await glob('src/**/*.ts', options).then((found) => found.sort())
    ).toEqual(files)
    expect(minimatch('src/main/index.ts', 'src/**/*.ts')).toBe(true)
    expect(minimatch('src/main/index.ts', 'src/post/**')).toBe(false)
  })

  it('preserves coverage include/exclude filtering and discovery', async () => {
    const exclude = new TestExclude({
      cwd: process.cwd(),
      include: ['src/**/*.ts'],
      exclude: ['src/post/**'],
      extension: ['.ts']
    })
    const files = exclude.globSync().sort()

    expect(files).toContain('src/main/index.ts')
    expect(files.some((file) => /^src[/\\]post[/\\]/.test(file))).toBe(false)
    expect(await exclude.glob().then((found) => found.sort())).toEqual(files)
  })
})
