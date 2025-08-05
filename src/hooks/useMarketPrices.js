import { useState, useEffect } from 'react'

// Market regions and stations
const JITA_REGION_ID = 10000002  // The Forge region (for sell orders)
const SYNDICATE_REGION_ID = 10000041  // Syndicate region (for buy orders)
const JITA_4_4_STATION = 60003760  // Jita 4-4 station ID
const CACHE_DURATION = 5 * 60 * 1000  // 5 minutes cache

export function useMarketPrices(typeIds) {
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!typeIds || typeIds.length === 0) {
      setLoading(false)
      setPrices({})
      return
    }

    const fetchPrices = async () => {
      setLoading(true)
      setError(null)

      try {
        // Check cache first
        const cached = localStorage.getItem('marketPrices')
        const cacheTime = localStorage.getItem('marketPricesTime')
        
        if (cached && cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION) {
          setPrices(JSON.parse(cached))
          setLoading(false)
          return
        }

        const newPrices = {}
        
        // Batch requests to avoid rate limiting
        const batchSize = 10
        for (let i = 0; i < typeIds.length; i += batchSize) {
          const batch = typeIds.slice(i, i + batchSize)
          
          const promises = batch.map(async (typeId) => {
            try {
              // Fetch Syndicate buy orders
              const syndicateResponse = await fetch(
                `https://esi.evetech.net/latest/markets/${SYNDICATE_REGION_ID}/orders/?type_id=${typeId}&order_type=buy`
              )
              
              // Fetch Jita sell orders
              const jitaResponse = await fetch(
                `https://esi.evetech.net/latest/markets/${JITA_REGION_ID}/orders/?type_id=${typeId}&order_type=sell`
              )
              
              let bestBuy = null
              let bestSell = null
              
              // Process Syndicate buy orders
              if (syndicateResponse.ok) {
                const syndicateBuyOrders = await syndicateResponse.json()
                if (syndicateBuyOrders.length > 0) {
                  bestBuy = Math.max(...syndicateBuyOrders.map(order => order.price))
                }
              }
              
              // Process Jita sell orders (filter for Jita 4-4 station)
              if (jitaResponse.ok) {
                const jitaSellOrders = await jitaResponse.json()
                const jita44Orders = jitaSellOrders.filter(order => order.location_id === JITA_4_4_STATION)
                if (jita44Orders.length > 0) {
                  bestSell = Math.min(...jita44Orders.map(order => order.price))
                }
              }
              
              newPrices[typeId] = {
                buy: bestBuy,
                sell: bestSell,
                spread: bestSell && bestBuy ? ((bestSell - bestBuy) / bestSell * 100).toFixed(2) : null,
                profit: bestSell && bestBuy ? bestSell - bestBuy : null
              }
            } catch (err) {
              console.error(`Error fetching price for ${typeId}:`, err)
              newPrices[typeId] = { buy: null, sell: null, spread: null, profit: null }
            }
          })
          
          await Promise.all(promises)
          
          // Small delay between batches
          if (i + batchSize < typeIds.length) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
        
        // Cache the results
        localStorage.setItem('marketPrices', JSON.stringify(newPrices))
        localStorage.setItem('marketPricesTime', Date.now().toString())
        
        setPrices(newPrices)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching market prices:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
  }, [typeIds])

  return { prices, loading, error }
}