import { useState, useMemo } from 'react'
import './App.css'
import { piTypeIds } from './data/piTypeIds'
import { tier0Resources, tier1Products, tier2Products, tier3Products, tier4Products } from './data/piResources'
import ProductRow from './components/ProductRow'
import { useMarketPrices } from './hooks/useMarketPrices'

function App() {
  const [filterTier, setFilterTier] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('tier') // 'tier' or 'profitPerM3'

  // Combine all products with their details
  const getAllProducts = () => {
    const allProducts = []
    
    // Add inputs from each tier
    Object.entries({ ...tier0Resources, ...tier1Products, ...tier2Products, ...tier3Products, ...tier4Products }).forEach(([name, details]) => {
      if (piTypeIds[name]) {
        allProducts.push({
          name,
          ...piTypeIds[name],
          inputs: details.inputs || [],
          outputPer: details.outputPer
        })
      }
    })
    
    return allProducts
  }

  const products = getAllProducts()

  // Filter products based on search and tier
  const filteredProductsBase = useMemo(() => {
    return products.filter(product => {
      const matchesTier = filterTier === 'All' || product.tier === filterTier
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesTier && matchesSearch
    })
  }, [filterTier, searchTerm])

  // Get all unique type IDs for price fetching
  const typeIds = useMemo(() => {
    return filteredProductsBase.map(p => p.typeId)
  }, [filteredProductsBase])

  const { prices, loading: pricesLoading } = useMarketPrices(typeIds)
  
  // Helper function to calculate profit per m³ for sorting
  const calculateProfitPerM3 = (product, pricesData) => {
    if (!pricesData) return 0
    const productPrices = pricesData[product.typeId]
    if (!productPrices || !productPrices.buy || !productPrices.sell) return 0
    
    // For P2 products, calculate with ingredients
    if (product.tier === 'P2' && product.inputs && product.inputs.length > 0) {
      let totalInputCost = 0
      let hasAllPrices = true
      
      for (const inputName of product.inputs) {
        const inputData = piTypeIds[inputName]
        if (!inputData) {
          hasAllPrices = false
          break
        }
        
        const inputPrices = pricesData[inputData.typeId]
        if (!inputPrices || inputPrices.buy === null) {
          hasAllPrices = false
          break
        }
        
        totalInputCost += inputPrices.buy * 40 // 40 units needed
      }
      
      if (!hasAllPrices) return 0
      
      const outputValue = productPrices.sell * (product.outputPer || 1)
      const importTax = totalInputCost * 0.015
      const exportTax = outputValue * 0.03
      const profit = outputValue - totalInputCost - importTax - exportTax
      const totalVolume = product.volume * (product.outputPer || 1)
      
      return profit / totalVolume
    }
    
    // For other tiers, simple calculation
    const profit = productPrices.sell - productPrices.buy
    return profit / product.volume
  }

  // Sort products - only sort by profit if prices are available
  const filteredProducts = useMemo(() => {
    const sorted = [...filteredProductsBase]
    
    if (sortBy === 'profitPerM3' && prices && !pricesLoading) {
      // Sort by profit per m³ (descending)
      sorted.sort((a, b) => {
        const profitA = calculateProfitPerM3(a, prices)
        const profitB = calculateProfitPerM3(b, prices)
        return profitB - profitA
      })
    } else {
      // Default tier-based sorting
      sorted.sort((a, b) => {
        const tierOrder = ['P0', 'P1', 'P2', 'P3', 'P4']
        const tierDiff = tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
        if (tierDiff !== 0) return tierDiff
        
        // Then sort alphabetically within each tier
        return a.name.localeCompare(b.name)
      })
    }
    
    return sorted
  }, [filteredProductsBase, sortBy, prices, pricesLoading])

  return (
    <div className="app">
      <header className="app-header">
        <h1>EVE Online PI Materials Database</h1>
        <p>Complete reference for Planetary Infrastructure materials</p>
      </header>

      <main className="app-main">
        <section className="controls">
          <div className="filter-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="tier-filters">
              <button 
                className={filterTier === 'All' ? 'active' : ''} 
                onClick={() => setFilterTier('All')}
              >
                All Tiers
              </button>
              <button 
                className={filterTier === 'P1' ? 'active' : ''} 
                onClick={() => setFilterTier('P1')}
              >
                P1
              </button>
              <button 
                className={filterTier === 'P2' ? 'active' : ''} 
                onClick={() => setFilterTier('P2')}
              >
                P2
              </button>
              <button 
                className={filterTier === 'P3' ? 'active' : ''} 
                onClick={() => setFilterTier('P3')}
              >
                P3
              </button>
              <button 
                className={filterTier === 'P4' ? 'active' : ''} 
                onClick={() => setFilterTier('P4')}
              >
                P4
              </button>
            </div>
            <div className="sort-controls">
              <label>Sort by:</label>
              <button 
                className={sortBy === 'tier' ? 'active' : ''} 
                onClick={() => setSortBy('tier')}
              >
                Tier
              </button>
              <button 
                className={sortBy === 'profitPerM3' ? 'active' : ''} 
                onClick={() => setSortBy('profitPerM3')}
              >
                Profit/m³
              </button>
            </div>
          </div>
        </section>

        <section className="materials-table-section">
          <table className="materials-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Name</th>
                <th>Type ID</th>
                <th>Tier</th>
                <th>Volume (m³)</th>
                <th>Inputs</th>
                <th>Output/Cycle</th>
                <th>Buy (Syndicate)</th>
                <th>Sell (Jita)</th>
                <th>Profit/m³</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <ProductRow 
                  key={product.typeId}
                  product={product}
                  prices={prices}
                  pricesLoading={pricesLoading}
                />
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="no-results">
              No materials found matching your criteria
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App