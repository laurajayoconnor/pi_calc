// Search for correct P0 Type IDs
const searchRange = [2265, 2320] // P0 items are in this range

async function findItemByName(targetName, startId, endId) {
  for (let typeId = startId; typeId <= endId; typeId++) {
    const url = `https://esi.evetech.net/latest/universe/types/${typeId}/?datasource=tranquility`
    
    try {
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        if (data.name === targetName) {
          console.log(`✓ Found ${targetName}: Type ID ${typeId}`)
          return typeId
        }
      }
    } catch (error) {
      // Skip errors
    }
    
    // Small delay to avoid rate limiting
    if (typeId % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  console.log(`✗ Not found: ${targetName}`)
  return null
}

async function findAll() {
  console.log('Searching for correct P0 Type IDs...\n')
  
  const itemsToFind = [
    'Autotrophs',
    'Heavy Water', 
    'Micro Organisms',
    'Planktic Colonies',
    'Suspended Plasma'
  ]
  
  for (const item of itemsToFind) {
    await findItemByName(item, searchRange[0], searchRange[1])
  }
  
  console.log('\nDone!')
}

findAll()