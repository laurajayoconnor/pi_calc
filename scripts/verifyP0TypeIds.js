// Test P0 Type IDs against ESI
const p0Items = [
  { name: 'Aqueous Liquids', typeId: 2268 },
  { name: 'Autotrophs', typeId: 2073 },
  { name: 'Base Metals', typeId: 2267 },
  { name: 'Carbon Compounds', typeId: 2288 },
  { name: 'Complex Organisms', typeId: 2287 },
  { name: 'Felsic Magma', typeId: 2307 },
  { name: 'Heavy Metals', typeId: 2272 },
  { name: 'Heavy Water', typeId: 2308 },
  { name: 'Ionic Solutions', typeId: 2309 },
  { name: 'Micro Organisms', typeId: 2286 },
  { name: 'Noble Gas', typeId: 2310 },
  { name: 'Noble Metals', typeId: 2270 },
  { name: 'Non-CS Crystals', typeId: 2306 },
  { name: 'Planktic Colonies', typeId: 2305 },
  { name: 'Reactive Gas', typeId: 2311 },
  { name: 'Suspended Plasma', typeId: 2269 }
]

async function verifyTypeId(item) {
  const url = `https://esi.evetech.net/latest/universe/types/${item.typeId}/?datasource=tranquility`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.log(`✗ ${item.name} (${item.typeId}) - NOT FOUND`)
      return false
    }
    
    const data = await response.json()
    if (data.name === item.name) {
      console.log(`✓ ${item.name} (${item.typeId}) - Correct`)
    } else {
      console.log(`✗ ${item.name} (${item.typeId}) - MISMATCH: ESI says "${data.name}"`)
    }
    return true
  } catch (error) {
    console.log(`✗ ${item.name} (${item.typeId}) - ERROR: ${error.message}`)
    return false
  }
}

async function verifyAll() {
  console.log('Verifying P0 Type IDs against ESI...\n')
  
  for (const item of p0Items) {
    await verifyTypeId(item)
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('\nDone!')
}

verifyAll()