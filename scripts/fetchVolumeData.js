import { piTypeIds } from '../src/data/piTypeIds.js'

const ESI_BASE_URL = 'https://esi.evetech.net/latest'

async function fetchTypeInfo(typeId) {
  const url = `${ESI_BASE_URL}/universe/types/${typeId}/?datasource=tranquility`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    return {
      typeId,
      name: data.name,
      volume: data.volume,
      packaged_volume: data.packaged_volume
    }
  } catch (error) {
    console.error(`Failed to fetch type ${typeId}: ${error.message}`)
    return null
  }
}

async function fetchAllVolumes() {
  console.log('Fetching volume data from EVE ESI API...\n')
  
  const results = {}
  const entries = Object.entries(piTypeIds)
  
  // Process in batches to avoid rate limiting
  const batchSize = 5
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize)
    
    const promises = batch.map(([name, data]) => 
      fetchTypeInfo(data.typeId).then(result => {
        if (result) {
          results[name] = result
          console.log(`✓ ${name} - Volume: ${result.volume} m³`)
        }
      })
    )
    
    await Promise.all(promises)
    
    // Small delay between batches
    if (i + batchSize < entries.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  // Group by tier and display results
  console.log('\n=== VOLUME DATA BY TIER ===\n')
  
  const tiers = ['P1', 'P2', 'P3', 'P4']
  for (const tier of tiers) {
    console.log(`${tier} Products:`)
    const tierItems = Object.entries(piTypeIds)
      .filter(([_, data]) => data.tier === tier)
      .map(([name, data]) => {
        const esiData = results[name]
        return {
          name,
          typeId: data.typeId,
          currentVolume: data.volume,
          esiVolume: esiData?.volume || 'N/A'
        }
      })
    
    tierItems.forEach(item => {
      const match = item.currentVolume === item.esiVolume ? '✓' : '✗'
      console.log(`  ${match} ${item.name}: Current: ${item.currentVolume} m³, ESI: ${item.esiVolume} m³`)
    })
    console.log()
  }
}

fetchAllVolumes().catch(console.error)