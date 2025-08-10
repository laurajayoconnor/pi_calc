import { useState, useMemo } from 'react'
import './App.css'
import { piTypeIds } from './data/piTypeIds'
import { piTaxValues } from './data/piTaxValues'
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

  // Get all unique type IDs for price fetching (including inputs)
  const typeIds = useMemo(() => {
    const ids = new Set()
    
    // Add all filtered product type IDs
    filteredProductsBase.forEach(product => {
      ids.add(product.typeId)
      
      // Also add all input type IDs for cost calculations
      if (product.inputs && product.inputs.length > 0) {
        product.inputs.forEach(inputName => {
          const inputData = piTypeIds[inputName]
          if (inputData) {
            ids.add(inputData.typeId)
          }
        })
      }
    })
    
    return Array.from(ids)
  }, [filteredProductsBase])

  const { prices, loading: pricesLoading } = useMarketPrices(typeIds)
  
  // Helper function to calculate crafting advantage percentage for sorting (for P2 and P3 items)
  const calculateCraftingAdvantage = (product, pricesData) => {
    // Only calculate for P2 and P3 items
    if (product.tier !== 'P2' && product.tier !== 'P3') return -Infinity // Sort non-P2/P3 items to the bottom
    
    if (!pricesData) return 0
    const productPrices = pricesData[product.typeId]
    if (!productPrices || !productPrices.buy || !productPrices.sell) return 0
    
    // For P2/P3 products, calculate crafting advantage
    if (product.inputs && product.inputs.length > 0) {
      let totalInputCost = 0
      let totalInputSellValue = 0
      let hasAllPrices = true
      
      const unitsNeeded = product.tier === 'P2' ? 40 : 10 // P2 needs 40 P1, P3 needs 10 P2
      const outputUnits = product.tier === 'P2' ? 5 : 3 // P2 produces 5, P3 produces 3
      
      for (const inputName of product.inputs) {
        const inputData = piTypeIds[inputName]
        if (!inputData) {
          hasAllPrices = false
          break
        }
        
        const inputPrices = pricesData[inputData.typeId]
        if (!inputPrices || inputPrices.buy === null || inputPrices.sell === null) {
          hasAllPrices = false
          break
        }
        
        totalInputCost += inputPrices.buy * unitsNeeded
        totalInputSellValue += inputPrices.sell * unitsNeeded
      }
      
      if (!hasAllPrices) return 0
      
      // Calculate direct trade profit (no taxes - just market trading)
      const directProfit = totalInputSellValue - totalInputCost
      
      // Calculate crafting profit with taxes
      const outputValue = productPrices.sell * outputUnits
      
      // For tax calculation, we use base values from piTaxValues
      let inputImportTax = 0
      let inputExportTax = 0
      
      if (product.tier === 'P2') {
        // P2 production: P1 materials only pay import tax
        for (const inputName of product.inputs) {
          const baseValue = piTaxValues[inputName] || 0
          inputImportTax += baseValue * unitsNeeded * 0.015
        }
      } else if (product.tier === 'P3') {
        // P3 production: P2 materials pay both import and export tax
        for (const inputName of product.inputs) {
          const baseValue = piTaxValues[inputName] || 0
          inputImportTax += baseValue * unitsNeeded * 0.015
          inputExportTax += baseValue * unitsNeeded * 0.03
        }
      }
      
      // Output export tax
      const outputBaseValue = piTaxValues[product.name] || 0
      const outputExportTax = outputBaseValue * outputUnits * 0.03
      
      const totalTaxes = inputImportTax + inputExportTax + outputExportTax
      const craftingProfit = outputValue - totalInputCost - totalTaxes
      
      // Calculate percentage advantage
      if (directProfit > 0) {
        return ((craftingProfit - directProfit) / directProfit) * 100
      }
      
      return 0
    }
    
    return 0
  }

  // Sort products - only sort by profit if prices are available
  const filteredProducts = useMemo(() => {
    const sorted = [...filteredProductsBase]
    
    if (sortBy === 'profitPerM3' && prices && !pricesLoading) {
      // Sort by crafting advantage percentage (descending)
      sorted.sort((a, b) => {
        const advantageA = calculateCraftingAdvantage(a, prices)
        const advantageB = calculateCraftingAdvantage(b, prices)
        return advantageB - advantageA
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
                <th>Tier</th>
                <th>Inputs</th>
                <th>Buy (Syndicate)</th>
                <th>Sell (Jita)</th>
                <th>Profit Crafting Advantage</th>
                <th>Tier Below Profit %</th>
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