import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'public', 'logo.png')

async function main() {
  await sharp(src)
    .resize(192, 192, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(join(root, 'public', 'pwa-192.png'))

  await sharp(src)
    .resize(512, 512, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(join(root, 'public', 'pwa-512.png'))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
