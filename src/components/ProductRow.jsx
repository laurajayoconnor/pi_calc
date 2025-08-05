import { useState } from 'react'
import IconCell from './IconCell'
import InputsCell from './InputsCell'
import PriceCell from './PriceCell'
import { piTypeIds } from '../data/piTypeIds'
import { piTaxValues } from '../data/piTaxValues'

function ProductRow({ product, prices, pricesLoading }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Allow expansion for P2 and P3 items
  const isExpandable = product.tier === 'P2' || product.tier === 'P3'
  
  // Calculate ingredient costs
  const calculateIngredientCost = () => {
    if (!product.inputs || product.inputs.length === 0) return null
    
    let totalBuyCost = 0
    let totalSellCost = 0
    let hasAllPrices = true
    
    // Determine units needed based on product tier
    const unitsNeededPerInput = product.tier === 'P2' ? 40 : 10 // P3 needs 10 units of each P2
    const outputUnits = product.tier === 'P2' ? 5 : 3 // P2 produces 5, P3 produces 3
    
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
      
      const unitsNeeded = unitsNeededPerInput
      const buyCost = inputPrices.buy * unitsNeeded
      const sellCost = inputPrices.sell * unitsNeeded
      
      totalBuyCost += buyCost
      totalSellCost += sellCost
      
      return {
        name: inputName,
        typeId: inputData.typeId,
        tier: inputData.tier,
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
    
    const outputValue = productPrices.sell * outputUnits
    
    // POCO tax rates - default 3% which splits as:
    const importTaxRate = 0.015 // 1.5% for imports (half of base 3%)
    const exportTaxRate = 0.03  // 3% for exports (full rate)
    
    // Calculate taxes for production using base values
    let inputImportTax = 0
    let inputExportTax = 0
    
    if (product.tier === 'P2') {
      // P2 production: P1 materials only pay import tax
      ingredientDetails.forEach(ingredient => {
        const baseValue = piTaxValues[ingredient.name] || 0
        inputImportTax += baseValue * ingredient.unitsNeeded * importTaxRate
      })
    } else if (product.tier === 'P3') {
      // P3 production: P2 materials pay both import and export tax
      ingredientDetails.forEach(ingredient => {
        const baseValue = piTaxValues[ingredient.name] || 0
        inputImportTax += baseValue * ingredient.unitsNeeded * importTaxRate
        inputExportTax += baseValue * ingredient.unitsNeeded * exportTaxRate
      })
    }
    
    // Output product: only export tax when shipping from planet
    const outputBaseValue = piTaxValues[product.name] || 0
    const outputExportTax = outputBaseValue * outputUnits * exportTaxRate
    
    // Total production taxes
    const totalProductionTaxes = inputImportTax + inputExportTax + outputExportTax
    
    // Total costs including production taxes
    const totalCostWithTaxBuy = totalBuyCost + totalProductionTaxes
    const totalCostWithTaxSell = totalSellCost + totalProductionTaxes
    
    const profitFromBuy = outputValue - totalBuyCost
    const profitFromSell = outputValue - totalSellCost
    const profitWithTaxBuy = outputValue - totalCostWithTaxBuy
    const profitWithTaxSell = outputValue - totalCostWithTaxSell
    
    const profitMarginBuy = ((profitFromBuy / outputValue) * 100).toFixed(1)
    const profitMarginSell = ((profitFromSell / outputValue) * 100).toFixed(1)
    const profitMarginWithTaxBuy = ((profitWithTaxBuy / outputValue) * 100).toFixed(1)
    const profitMarginWithTaxSell = ((profitWithTaxSell / outputValue) * 100).toFixed(1)
    
    // Calculate profit per m³
    const totalOutputVolume = product.volume * outputUnits
    const profitPerM3Buy = profitWithTaxBuy / totalOutputVolume
    const profitPerM3Sell = profitWithTaxSell / totalOutputVolume
    
    // Calculate volumes for comparison
    let directTradeVolume = 0
    if (product.tier === 'P2') {
      // P1 volume: 40 units * number of ingredients * 0.19 m³
      directTradeVolume = 40 * product.inputs.length * 0.19
    } else if (product.tier === 'P3') {
      // P2 volume: 10 units * number of ingredients * 0.75 m³
      directTradeVolume = 10 * product.inputs.length * 0.75
    }
    
    // Option 1: Buy inputs in Syndicate, transport to Jita, sell
    const directTradeBuyCost = totalBuyCost
    const directTradeSellValue = totalSellCost
    
    // Direct trade has NO taxes - just market trading, no planetary interaction
    const directTradeProfit = directTradeSellValue - directTradeBuyCost
    const directTradeProfitPerM3 = directTradeProfit / directTradeVolume
    
    // Option 2: Buy inputs in Syndicate, craft product, sell at Jita (already calculated above)
    // profitWithTaxBuy is the profit from this option
    
    // Comparison: Additional profit from crafting vs direct trade
    const additionalProfitFromCrafting = profitWithTaxBuy - directTradeProfit
    const additionalProfitPerM3 = profitPerM3Buy - directTradeProfitPerM3
    const percentageGain = directTradeProfit > 0 ? ((additionalProfitFromCrafting / directTradeProfit) * 100) : 0
    
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
      inputImportTax,
      inputExportTax,
      outputExportTax,
      totalProductionTaxes,
      totalCostWithTaxBuy,
      totalCostWithTaxSell,
      profitWithTaxBuy,
      profitWithTaxSell,
      profitMarginWithTaxBuy,
      profitMarginWithTaxSell,
      totalOutputVolume,
      profitPerM3Buy,
      profitPerM3Sell,
      directTradeBuyCost,
      directTradeSellValue,
      directTradeProfit,
      directTradeProfitPerM3,
      directTradeVolume,
      additionalProfitFromCrafting,
      additionalProfitPerM3,
      percentageGain
    }
  }
  
  const costAnalysis = isExpandable && !pricesLoading ? calculateIngredientCost() : null
  
  // Calculate crafting advantage percentage for display (for P2 and P3 items)
  const calculateCraftingAdvantageDisplay = () => {
    // Only show for P2 and P3 items
    if (product.tier !== 'P2' && product.tier !== 'P3') return null
    
    const productPrices = prices[product.typeId]
    if (!productPrices || !productPrices.buy || !productPrices.sell) return null
    
    // Use the percentage gain from costAnalysis
    if (costAnalysis && costAnalysis.percentageGain !== undefined) {
      return costAnalysis.percentageGain
    }
    
    return null
  }
  
  const craftingAdvantage = !pricesLoading ? calculateCraftingAdvantageDisplay() : null
  
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
          ) : craftingAdvantage !== null ? (
            <span className={craftingAdvantage > 0 ? 'profit-positive' : 'profit-negative'}>
              {craftingAdvantage > 0 ? '+' : ''}{craftingAdvantage.toFixed(1)}%
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
              <h4>Production Analysis for {product.name}</h4>
              
              <table className="production-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Volume</th>
                    <th>Buy (Syndicate)</th>
                    <th>Sell (Jita)</th>
                    <th>Profit/m³</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Input ingredients */}
                  {costAnalysis.ingredientDetails.map((ingredient, idx) => {
                    const ingredientData = piTypeIds[ingredient.name]
                    return (
                      <tr key={`input-${idx}`} className="input-row">
                        <td className="item-cell">
                          <div className="item-with-icon">
                            <img 
                              src={`/icons/${ingredient.typeId}.png`}
                              alt={ingredient.name}
                              className="item-icon"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'inline'
                              }}
                            />
                            <span className="item-icon-fallback" style={{ display: 'none' }}>
                              {ingredientData?.icon || '📦'}
                            </span>
                            <span>{ingredient.name}</span>
                          </div>
                        </td>
                        <td className="type-cell">Input</td>
                        <td className="quantity-cell">{ingredient.unitsNeeded}</td>
                        <td className="volume-cell">{(ingredient.unitsNeeded * (product.tier === 'P2' ? 0.19 : 0.75)).toFixed(2)} m³</td>
                        <td className="price-buy">{ingredient.totalBuyCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                        <td className="price-sell">{ingredient.totalSellCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                        <td>-</td>
                      </tr>
                    )
                  })}
                  
                  {/* Subtotal row */}
                  <tr className="subtotal-row">
                    <td colSpan="4" className="subtotal-label">Input Purchase Cost</td>
                    <td className="price-buy">{costAnalysis.totalBuyCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td className="price-sell">{costAnalysis.totalSellCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td>-</td>
                  </tr>
                  
                  {/* Output product */}
                  <tr className="output-row">
                    <td className="item-cell">
                      <div className="item-with-icon">
                        <img 
                          src={`/icons/${product.typeId}.png`}
                          alt={product.name}
                          className="item-icon"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'inline'
                          }}
                        />
                        <span className="item-icon-fallback" style={{ display: 'none' }}>
                          {product.icon || '📦'}
                        </span>
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td className="type-cell">Output</td>
                    <td className="quantity-cell">{costAnalysis.outputUnits}</td>
                    <td className="volume-cell">{costAnalysis.totalOutputVolume.toFixed(2)} m³</td>
                    <td>-</td>
                    <td className="price-sell">{costAnalysis.outputValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td className={costAnalysis.profitPerM3Buy > 0 ? 'profit-positive' : 'profit-negative'}>
                      {costAnalysis.profitPerM3Buy.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK/m³
                    </td>
                  </tr>
                  
                  {/* Production Costs Section Header */}
                  <tr className="section-header">
                    <td colSpan="7" style={{ textAlign: 'center', fontWeight: 'bold', color: '#ff6b35' }}>Production Costs & Taxes</td>
                  </tr>
                  
                  {/* Input Import Tax */}
                  <tr className="tax-row">
                    <td colSpan="4" className="tax-label">
                      {product.tier === 'P2' ? 'P1' : 'P2'} Import Tax (1.5% on base value)
                    </td>
                    <td colSpan="2" className="tax-value">-{costAnalysis.inputImportTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td>-</td>
                  </tr>
                  
                  {/* Input Export Tax (only for P3) */}
                  {product.tier === 'P3' && (
                    <tr className="tax-row">
                      <td colSpan="4" className="tax-label">P2 Export Tax (3% on base value)</td>
                      <td colSpan="2" className="tax-value">-{costAnalysis.inputExportTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                      <td>-</td>
                    </tr>
                  )}
                  
                  {/* Output Export tax */}
                  <tr className="tax-row">
                    <td colSpan="4" className="tax-label">
                      {product.tier} Export Tax (3% on base value)
                    </td>
                    <td colSpan="2" className="tax-value">-{costAnalysis.outputExportTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td>-</td>
                  </tr>
                  
                  {/* Total Tax row */}
                  <tr className="subtotal-row">
                    <td colSpan="4" className="subtotal-label">Total Taxes</td>
                    <td colSpan="2" className="tax-value">-{costAnalysis.totalProductionTaxes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td>-</td>
                  </tr>
                  
                  {/* Net profit row */}
                  <tr className="profit-row">
                    <td colSpan="4" className="profit-label">Net Profit</td>
                    <td className={costAnalysis.profitWithTaxBuy > 0 ? 'profit-positive' : 'profit-negative'}>
                      {costAnalysis.profitWithTaxBuy.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK
                    </td>
                    <td className={costAnalysis.profitWithTaxSell > 0 ? 'profit-positive' : 'profit-negative'}>
                      {costAnalysis.profitWithTaxSell.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK
                    </td>
                    <td className={costAnalysis.profitPerM3Buy > 0 ? 'profit-positive' : 'profit-negative'}>
                      {((costAnalysis.profitWithTaxBuy / costAnalysis.outputValue) * 100).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <h5 className="comparison-header">{product.tier === 'P2' ? 'P1' : 'P2'} Direct Trade vs {product.tier} Crafting:</h5>
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>Volume</th>
                    <th>Revenue</th>
                    <th>Cost</th>
                    <th>Tax</th>
                    <th>Net Profit</th>
                    <th>Profit/m³</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="p1-trade-row">
                    <td>{product.tier === 'P2' ? 'P1' : 'P2'} Direct Trade</td>
                    <td>{costAnalysis.directTradeVolume.toFixed(2)} m³</td>
                    <td className="price-sell">{costAnalysis.directTradeSellValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td className="price-buy">{costAnalysis.directTradeBuyCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td className="tax-value">0 ISK</td>
                    <td className={costAnalysis.directTradeProfit > 0 ? 'profit-positive' : 'profit-negative'}>
                      {costAnalysis.directTradeProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK
                    </td>
                    <td className={costAnalysis.directTradeProfitPerM3 > 0 ? 'profit-positive' : 'profit-negative'}>
                      {costAnalysis.directTradeProfitPerM3.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK/m³
                    </td>
                  </tr>
                  <tr className="p2-craft-row">
                    <td>{product.tier} Crafting</td>
                    <td>{costAnalysis.totalOutputVolume.toFixed(2)} m³</td>
                    <td className="price-sell">{costAnalysis.outputValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td className="price-buy">{costAnalysis.totalBuyCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td className="tax-value">{costAnalysis.totalProductionTaxes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td className={costAnalysis.profitWithTaxBuy > 0 ? 'profit-positive' : 'profit-negative'}>
                      {costAnalysis.profitWithTaxBuy.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK
                    </td>
                    <td className={costAnalysis.profitPerM3Buy > 0 ? 'profit-positive' : 'profit-negative'}>
                      {costAnalysis.profitPerM3Buy.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK/m³
                    </td>
                  </tr>
                  <tr className="difference-row">
                    <td>Crafting Advantage</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td className={costAnalysis.additionalProfitFromCrafting > 0 ? 'profit-positive' : 'profit-negative'}>
                      {costAnalysis.additionalProfitFromCrafting > 0 ? '+' : ''}{costAnalysis.additionalProfitFromCrafting.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK
                      ({costAnalysis.additionalProfitFromCrafting > 0 ? '+' : ''}{costAnalysis.percentageGain.toFixed(1)}%)
                    </td>
                    <td className={costAnalysis.additionalProfitPerM3 > 0 ? 'profit-positive' : 'profit-negative'}>
                      {costAnalysis.additionalProfitPerM3 > 0 ? '+' : ''}{costAnalysis.additionalProfitPerM3.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK/m³
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default ProductRow