// One-off: strip near-black background from the club logo → transparent PNG.
// Preserves the navy ball (b channel stays above threshold). Original saved as logo-orig.png.
import { copyFileSync } from 'node:fs'
import sharp from 'sharp'

const SRC = 'public/brand/logo.png'
const BACKUP = 'public/brand/logo-orig.png'
import { existsSync } from 'node:fs'
const THRESHOLD = 30 // r,g,b all below this → transparent

const input = existsSync(BACKUP) ? BACKUP : SRC
if (!existsSync(BACKUP)) copyFileSync(SRC, BACKUP)

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

for (let i = 0; i < data.length; i += info.channels) {
  const r = data[i], g = data[i + 1], b = data[i + 2]
  if (r < THRESHOLD && g < THRESHOLD && b < THRESHOLD) data[i + 3] = 0
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
  .png()
  // trim transparent margins so the art fills the image box — removes the visual
  // top gap in the header
  .trim({ threshold: 10 })
  .toFile(SRC)

console.log(`stripped ${SRC} (backup → ${BACKUP})`)
