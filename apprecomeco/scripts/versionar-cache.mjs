import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const output = 'dist'
const hash = createHash('sha256')
const files = (await readdir(output, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => join(entry.parentPath, entry.name))
  .sort()

for (const file of files) {
  hash.update(file.replaceAll('\\', '/'))
  hash.update(await readFile(file))
}

const worker = join(output, 'sw.js')
const source = await readFile(worker, 'utf8')
const art = files.map((file) => relative(output, file).replaceAll('\\', '/'))
  .filter((file) => file.startsWith('arte/') && file !== 'arte/recomeco.png')
await writeFile(worker, source
  .replace('__BUILD_VERSION__', hash.digest('hex').slice(0, 16))
  .replace('[] /* ARTE_OFFLINE */', JSON.stringify(art)))
