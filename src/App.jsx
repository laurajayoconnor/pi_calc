import { useState, useMemo } from 'react'
import './App.css'
import { piTypeIds } from './data/piTypeIds'
import { tier0Resources, tier1Products, tier2Products, tier3Products, tier4Products } from './data/piResources'
import IconCell from './components/IconCell'
import InputsCell from './components/InputsCell'
import PriceCell from './components/PriceCell'
import { useMarketPrices } from './hooks/useMarketPrices'

function App() {
  const [filterTier, setFilterTier] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

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
  
  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesTier = filterTier === 'All' || product.tier === filterTier
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesTier && matchesSearch
    })
    .sort((a, b) => {
      // First sort by tier (P0, P1, P2, P3, P4)
      const tierOrder = ['P0', 'P1', 'P2', 'P3', 'P4']
      const tierDiff = tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
      if (tierDiff !== 0) return tierDiff
      
      // Then sort alphabetically within each tier
      return a.name.localeCompare(b.name)
    })

  // Get all unique type IDs for price fetching
  const typeIds = useMemo(() => {
    return filteredProducts.map(p => p.typeId)
  }, [filteredProducts])

  const { prices, loading: pricesLoading } = useMarketPrices(typeIds)

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
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.typeId}>
                  <IconCell 
                    typeId={product.typeId} 
                    name={product.name} 
                    fallbackIcon={product.icon} 
                  />
                  <td className="name-cell">{product.name}</td>
                  <td className="typeid-cell">{product.typeId}</td>
                  <td className={`tier-cell tier-${product.tier.toLowerCase()}`}>
                    {product.tier}
                  </td>
                  <td className="volume-cell">{product.volume}</td>
                  <InputsCell inputs={product.inputs} />
                  <td className="output-cell">{product.outputPer || '-'}</td>
                  <td className="price-cell">
                    {pricesLoading ? (
                      <span className="price-loading">...</span>
                    ) : (
                      <PriceCell price={prices[product.typeId]?.buy} type="buy" />
                    )}
                  </td>
                  <td className="price-cell">
                    {pricesLoading ? (
                      <span className="price-loading">...</span>
                    ) : (
                      <PriceCell price={prices[product.typeId]?.sell} type="sell" />
                    )}
                  </td>
                </tr>
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