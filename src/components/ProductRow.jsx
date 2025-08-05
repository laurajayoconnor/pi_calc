import { useState } from 'react'
import IconCell from './IconCell'
import InputsCell from './InputsCell'
import PriceCell from './PriceCell'
import { piTypeIds } from '../data/piTypeIds'

function ProductRow({ product, prices, pricesLoading }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Only allow expansion for P2 items
  const isExpandable = product.tier === 'P2'
  
  // Calculate ingredient costs
  const calculateIngredientCost = () => {
    if (!product.inputs || product.inputs.length === 0) return null
    
    let totalBuyCost = 0
    let totalSellCost = 0
    let hasAllPrices = true
    
    const ingredientDetails = product.inputs.map(inputName => {
      const inputData = piTypeIds[inputName]
      if (!inputData) {
        hasAllPrices = false
        return null
      }
      
      const inputPrices = prices[inputData.typeId]
      if (!inputPrices || inputPrices.buy === null || inputPrices.sell === null) {
        hasAllPrices = false
        return null
      }
      
      // For P2 products, we need 40 units of each P1 input (2 batches of 20)
      const unitsNeeded = 40
      const buyCost = inputPrices.buy * unitsNeeded
      const sellCost = inputPrices.sell * unitsNeeded
      
      totalBuyCost += buyCost
      totalSellCost += sellCost
      
      return {
        name: inputName,
        typeId: inputData.typeId,
        unitsNeeded,
        buyPrice: inputPrices.buy,
        sellPrice: inputPrices.sell,
        totalBuyCost: buyCost,
        totalSellCost: sellCost
      }
    }).filter(Boolean)
    
    if (!hasAllPrices) return null
    
    const productPrices = prices[product.typeId]
    if (!productPrices || productPrices.sell === null) return null
    
    // P2 products produce 5 units per cycle
    const outputUnits = 5
    const outputValue = productPrices.sell * outputUnits
    
    // POCO tax rates
    const importTaxRate = 0.015 // 1.5% (half of 3% for imports)
    const exportTaxRate = 0.03  // 3% (full rate for exports)
    
    // Calculate import taxes for P1 materials
    const importTaxBuy = totalBuyCost * importTaxRate
    const importTaxSell = totalSellCost * importTaxRate
    
    // Calculate export tax for P2 product
    const exportTax = outputValue * exportTaxRate
    
    // Total costs including taxes
    const totalCostWithTaxBuy = totalBuyCost + importTaxBuy + exportTax
    const totalCostWithTaxSell = totalSellCost + importTaxSell + exportTax
    
    const profitFromBuy = outputValue - totalBuyCost
    const profitFromSell = outputValue - totalSellCost
    const profitWithTaxBuy = outputValue - totalCostWithTaxBuy
    const profitWithTaxSell = outputValue - totalCostWithTaxSell
    
    const profitMarginBuy = ((profitFromBuy / outputValue) * 100).toFixed(1)
    const profitMarginSell = ((profitFromSell / outputValue) * 100).toFixed(1)
    const profitMarginWithTaxBuy = ((profitWithTaxBuy / outputValue) * 100).toFixed(1)
    const profitMarginWithTaxSell = ((profitWithTaxSell / outputValue) * 100).toFixed(1)
    
    // Calculate profit per m³
    // P2 products are 0.75 m³ each, producing 5 units = 3.75 m³ total
    const totalOutputVolume = product.volume * outputUnits
    const profitPerM3Buy = profitWithTaxBuy / totalOutputVolume
    const profitPerM3Sell = profitWithTaxSell / totalOutputVolume
    
    return {
      ingredientDetails,
      totalBuyCost,
      totalSellCost,
      outputValue,
      outputUnits,
      profitFromBuy,
      profitFromSell,
      profitMarginBuy,
      profitMarginSell,
      importTaxBuy,
      importTaxSell,
      exportTax,
      totalCostWithTaxBuy,
      totalCostWithTaxSell,
      profitWithTaxBuy,
      profitWithTaxSell,
      profitMarginWithTaxBuy,
      profitMarginWithTaxSell,
      totalOutputVolume,
      profitPerM3Buy,
      profitPerM3Sell
    }
  }
  
  const costAnalysis = isExpandable && !pricesLoading ? calculateIngredientCost() : null
  
  // Calculate profit per m³ for display (only for P2 items)
  const calculateProfitPerM3Display = () => {
    // Only show profit for P2 items
    if (product.tier !== 'P2') return null
    
    const productPrices = prices[product.typeId]
    if (!productPrices || !productPrices.buy || !productPrices.sell) return null
    
    // Use the detailed calculation from costAnalysis
    if (costAnalysis && costAnalysis.profitPerM3Buy !== undefined) {
      return costAnalysis.profitPerM3Buy
    }
    
    return null
  }
  
  const profitPerM3 = !pricesLoading ? calculateProfitPerM3Display() : null
  
  return (
    <>
      <tr 
        className={isExpandable ? 'expandable-row' : ''}
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      >
        <IconCell 
          typeId={product.typeId} 
          name={product.name} 
          fallbackIcon={product.icon} 
        />
        <td className="name-cell">
          {isExpandable && (
            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          )}
          {product.name}
        </td>
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
        <td className="profit-cell">
          {pricesLoading ? (
            <span className="price-loading">...</span>
          ) : profitPerM3 !== null ? (
            <span className={profitPerM3 > 0 ? 'profit-positive' : 'profit-negative'}>
              {profitPerM3.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          ) : (
            <span className="price-na">N/A</span>
          )}
        </td>
      </tr>
      
      {isExpanded && costAnalysis && (
        <tr className="expanded-details">
          <td colSpan="10">
            <div className="cost-analysis">
              <h4>Cost Analysis for {product.name}</h4>
              
              <div className="ingredient-costs">
                <h5>Input Costs (per production cycle):</h5>
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th>Units Needed</th>
                      <th>Buy Price</th>
                      <th>Sell Price</th>
                      <th>Total Buy Cost</th>
                      <th>Total Sell Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costAnalysis.ingredientDetails.map((ingredient, idx) => {
                      const ingredientData = piTypeIds[ingredient.name]
                      return (
                        <tr key={idx}>
                          <td className="ingredient-name-cell">
                            <div className="ingredient-with-icon">
                              <img 
                                src={`/icons/${ingredient.typeId}.png`}
                                alt={ingredient.name}
                                className="ingredient-icon"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'inline'
                                }}
                              />
                              <span className="ingredient-icon-fallback" style={{ display: 'none' }}>
                                {ingredientData?.icon || '📦'}
                              </span>
                              <span>{ingredient.name}</span>
                            </div>
                          </td>
                          <td>{ingredient.unitsNeeded}</td>
                          <td className="price-buy">{ingredient.buyPrice.toFixed(2)} ISK</td>
                          <td className="price-sell">{ingredient.sellPrice.toFixed(2)} ISK</td>
                          <td className="price-buy">{ingredient.totalBuyCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                          <td className="price-sell">{ingredient.totalSellCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="4">Total Input Cost:</th>
                      <th className="price-buy">{costAnalysis.totalBuyCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</th>
                      <th className="price-sell">{costAnalysis.totalSellCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="profit-summary">
                <h5>Production Summary:</h5>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="label">Output:</span>
                    <span className="value">{costAnalysis.outputUnits} units of {product.name} ({costAnalysis.totalOutputVolume} m³)</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Output Value (Jita Sell):</span>
                    <span className="value price-sell">{costAnalysis.outputValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Profit before tax (Syndicate inputs):</span>
                    <span className={`value ${costAnalysis.profitFromBuy > 0 ? 'profit-positive' : 'profit-negative'}`}>
                      {costAnalysis.profitFromBuy.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK ({costAnalysis.profitMarginBuy}%)
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Profit before tax (Jita inputs):</span>
                    <span className={`value ${costAnalysis.profitFromSell > 0 ? 'profit-positive' : 'profit-negative'}`}>
                      {costAnalysis.profitFromSell.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK ({costAnalysis.profitMarginSell}%)
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Import Tax (1.5% on inputs):</span>
                    <span className="value">
                      {costAnalysis.importTaxBuy.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK (Syndicate) / {costAnalysis.importTaxSell.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK (Jita)
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Export Tax (3% on output):</span>
                    <span className="value">
                      {costAnalysis.exportTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Profit after tax (Syndicate inputs):</span>
                    <span className={`value ${costAnalysis.profitWithTaxBuy > 0 ? 'profit-positive' : 'profit-negative'}`}>
                      {costAnalysis.profitWithTaxBuy.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK ({costAnalysis.profitMarginWithTaxBuy}%)
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Profit after tax (Jita inputs):</span>
                    <span className={`value ${costAnalysis.profitWithTaxSell > 0 ? 'profit-positive' : 'profit-negative'}`}>
                      {costAnalysis.profitWithTaxSell.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK ({costAnalysis.profitMarginWithTaxSell}%)
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Profit per m³ (Syndicate inputs):</span>
                    <span className={`value ${costAnalysis.profitPerM3Buy > 0 ? 'profit-positive' : 'profit-negative'}`}>
                      {costAnalysis.profitPerM3Buy.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK/m³
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Profit per m³ (Jita inputs):</span>
                    <span className={`value ${costAnalysis.profitPerM3Sell > 0 ? 'profit-positive' : 'profit-negative'}`}>
                      {costAnalysis.profitPerM3Sell.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK/m³
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default ProductRow