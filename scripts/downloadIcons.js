import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { piTypeIds } from '../src/data/piTypeIds.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons')
const DELAY_MS = 500 // 500ms delay between requests to be respectful

// Create icons directory if it doesn't exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true })
}

async function downloadIcon(typeId, name) {
  const url = `https://images.evetech.net/types/${typeId}/icon?size=64`
  const filepath = path.join(ICONS_DIR, `${typeId}.png`)
  
  // Skip if already downloaded
  if (fs.existsSync(filepath)) {
    console.log(`✓ ${name} (${typeId}) - already exists`)
    return
  }

  try {
    console.log(`⬇ Downloading ${name} (${typeId})...`)
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(buffer))
    console.log(`✓ ${name} (${typeId}) - downloaded`)
  } catch (error) {
    console.error(`✗ ${name} (${typeId}) - failed: ${error.message}`)
  }
}

async function downloadAllIcons() {
  console.log(`Downloading EVE Online PI icons to ${ICONS_DIR}\n`)
  
  const entries = Object.entries(piTypeIds)
  
  for (let i = 0; i < entries.length; i++) {
    const [name, data] = entries[i]
    await downloadIcon(data.typeId, name)
    
    // Add delay between requests (except for the last one)
    if (i < entries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
    }
  }
  
  console.log('\nDownload complete!')
}

downloadAllIcons().catch(console.error)