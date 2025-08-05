import { useState } from 'react'
import IconCell from './IconCell'
import InputsCell from './InputsCell'
import PriceCell from './PriceCell'
import { piTypeIds } from '../data/piTypeIds'
import { piTaxValues } from '../data/piTaxValues'

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
    
    // POCO tax rates - default 3% which splits as:
    const importTaxRate = 0.015 // 1.5% for imports (half of base 3%)
    const exportTaxRate = 0.03  // 3% for exports (full rate)
    
    // Calculate taxes for P1 materials using base values
    let p1ImportTax = 0
    let p1ExportTax = 0
    ingredientDetails.forEach(ingredient => {
      const baseValue = piTaxValues[ingredient.name] || 0
      p1ImportTax += baseValue * ingredient.unitsNeeded * importTaxRate
      p1ExportTax += baseValue * ingredient.unitsNeeded * exportTaxRate
    })
    
    // Calculate taxes for P2 product using base value
    const p2BaseValue = piTaxValues[product.name] || 0
    const p2ImportTax = p2BaseValue * outputUnits * importTaxRate
    const p2ExportTax = p2BaseValue * outputUnits * exportTaxRate
    
    // Total taxes (all import/export taxes)
    const totalTaxes = p1ImportTax + p1ExportTax + p2ImportTax + p2ExportTax
    
    // Total costs including appropriate taxes
    const totalCostWithTaxBuy = totalBuyCost + totalTaxes
    const totalCostWithTaxSell = totalSellCost + totalTaxes
    
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
    
    // Calculate direct P1 trade profit (Buy in Syndicate, Sell at Jita)
    // Total P1 volume: 40 units * number of ingredients * 0.19 m³
    const totalP1Volume = 40 * product.inputs.length * 0.19
    
    // Option 1: Buy P1 in Syndicate, transport to Jita, sell
    const p1BuyCost = totalBuyCost // Cost to buy P1 in Syndicate
    const p1SellValue = totalSellCost // Revenue from selling P1 at Jita
    
    // P1 direct trade only pays export tax at Jita (no import/export at planet)
    let p1DirectExportTax = 0
    ingredientDetails.forEach(ingredient => {
      const baseValue = piTaxValues[ingredient.name] || 0
      p1DirectExportTax += baseValue * ingredient.unitsNeeded * exportTaxRate
    })
    
    const p1DirectProfit = p1SellValue - p1BuyCost - p1DirectExportTax
    const p1DirectProfitPerM3 = p1DirectProfit / totalP1Volume
    
    // Option 2: Buy P1 in Syndicate, craft P2, sell P2 at Jita (already calculated above)
    // profitWithTaxBuy is the profit from this option
    
    // Comparison: Additional profit from crafting P2 vs direct P1 trade
    const additionalProfitFromCrafting = profitWithTaxBuy - p1DirectProfit
    const additionalProfitPerM3 = profitPerM3Buy - p1DirectProfitPerM3
    const percentageGain = p1DirectProfit > 0 ? ((additionalProfitFromCrafting / p1DirectProfit) * 100) : 0
    
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
      p1ImportTax,
      p1ExportTax,
      p2ImportTax,
      p2ExportTax,
      totalTaxes,
      totalCostWithTaxBuy,
      totalCostWithTaxSell,
      profitWithTaxBuy,
      profitWithTaxSell,
      profitMarginWithTaxBuy,
      profitMarginWithTaxSell,
      totalOutputVolume,
      profitPerM3Buy,
      profitPerM3Sell,
      p1BuyCost,
      p1SellValue,
      p1DirectExportTax,
      p1DirectProfit,
      p1DirectProfitPerM3,
      totalP1Volume,
      additionalProfitFromCrafting,
      additionalProfitPerM3,
      percentageGain
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
                        <td className="volume-cell">{(ingredient.unitsNeeded * 0.19).toFixed(2)} m³</td>
                        <td className="price-buy">{ingredient.totalBuyCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                        <td className="price-sell">{ingredient.totalSellCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                        <td>-</td>
                      </tr>
                    )
                  })}
                  
                  {/* Subtotal row */}
                  <tr className="subtotal-row">
                    <td colSpan="4" className="subtotal-label">Input Subtotal</td>
                    <td className="price-buy">{costAnalysis.totalBuyCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td className="price-sell">{costAnalysis.totalSellCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td>-</td>
                  </tr>
                  
                  {/* P1 Import Tax row */}
                  <tr className="tax-row">
                    <td colSpan="4" className="tax-label">P1 Import Tax (1.5%)</td>
                    <td colSpan="2" className="tax-value">-{costAnalysis.p1ImportTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td>-</td>
                  </tr>
                  
                  {/* P1 Export Tax row */}
                  <tr className="tax-row">
                    <td colSpan="4" className="tax-label">P1 Export Tax (3%)</td>
                    <td colSpan="2" className="tax-value">-{costAnalysis.p1ExportTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td>-</td>
                  </tr>
                  
                  {/* Input total with taxes */}
                  <tr className="subtotal-row">
                    <td colSpan="4" className="subtotal-label">Total Input Cost (with P1 taxes)</td>
                    <td className="price-buy">{(costAnalysis.totalBuyCost + costAnalysis.p1ImportTax + costAnalysis.p1ExportTax).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td className="price-sell">{(costAnalysis.totalSellCost + costAnalysis.p1ImportTax + costAnalysis.p1ExportTax).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td>-</td>
                  </tr>
                  
                  {/* P2 Import Tax row */}
                  <tr className="tax-row">
                    <td colSpan="4" className="tax-label">P2 Import Tax (1.5%)</td>
                    <td colSpan="2" className="tax-value">-{costAnalysis.p2ImportTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
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
                  
                  {/* P2 Export tax */}
                  <tr className="tax-row">
                    <td colSpan="4" className="tax-label">P2 Export Tax (3%)</td>
                    <td colSpan="2" className="tax-value">-{costAnalysis.p2ExportTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
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
              
              <h5 className="comparison-header">P1 Direct Trade vs P2 Crafting:</h5>
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
                    <td>P1 Direct Trade</td>
                    <td>{costAnalysis.totalP1Volume.toFixed(2)} m³</td>
                    <td className="price-sell">{costAnalysis.p1SellValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td className="price-buy">{costAnalysis.p1BuyCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td className="tax-value">{costAnalysis.p1DirectExportTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td className={costAnalysis.p1DirectProfit > 0 ? 'profit-positive' : 'profit-negative'}>
                      {costAnalysis.p1DirectProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK
                    </td>
                    <td className={costAnalysis.p1DirectProfitPerM3 > 0 ? 'profit-positive' : 'profit-negative'}>
                      {costAnalysis.p1DirectProfitPerM3.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK/m³
                    </td>
                  </tr>
                  <tr className="p2-craft-row">
                    <td>P2 Crafting</td>
                    <td>{costAnalysis.totalOutputVolume.toFixed(2)} m³</td>
                    <td className="price-sell">{costAnalysis.outputValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td className="price-buy">{costAnalysis.totalBuyCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
                    <td className="tax-value">{costAnalysis.totalTaxes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK</td>
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