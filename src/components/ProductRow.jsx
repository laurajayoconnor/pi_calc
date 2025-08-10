import { useState } from 'react'
import IconCell from './IconCell'
import InputsCell from './InputsCell'
import PriceCell from './PriceCell'
import Tooltip from './Tooltip'
import { piTypeIds } from '../data/piTypeIds'
import { piTaxValues } from '../data/piTaxValues'
import { tier2Products, tier3Products, tier4Products } from '../data/piResources'

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
      return {
        percentage: costAnalysis.percentageGain,
        details: costAnalysis
      }
    }
    
    return null
  }
  
  const craftingAdvantage = !pricesLoading ? calculateCraftingAdvantageDisplay() : null
  
  // Calculate tier below to final product profit percentage (with taxes)
  const calculateTierBelowToProductProfit = () => {
    // Skip if prices aren't loaded or if this is a P1 product
    if (pricesLoading || !prices || product.tier === 'P1') return null
    
    const productPrices = prices[product.typeId]
    if (!productPrices || !productPrices.sell) return null
    
    // Get direct inputs (tier below)
    const productDetails = 
      tier2Products[product.name] ||
      tier3Products[product.name] || 
      tier4Products[product.name]
    
    if (!productDetails || !productDetails.inputs) return null
    
    // Calculate total input cost
    let totalInputCost = 0
    let hasAllPrices = true
    
    // Determine output quantity
    let outputQuantity = 1
    if (product.tier === 'P2') outputQuantity = 5
    else if (product.tier === 'P3') outputQuantity = 3
    else if (product.tier === 'P4') outputQuantity = 1
    
    for (const inputName of productDetails.inputs) {
      const inputData = piTypeIds[inputName]
      if (!inputData) {
        hasAllPrices = false
        break
      }
      
      const inputPrices = prices[inputData.typeId]
      if (!inputPrices || inputPrices.buy === null) {
        hasAllPrices = false
        break
      }
      
      // Determine how many inputs we need based on production ratios
      let inputsNeeded = 1
      if (product.tier === 'P2') {
        inputsNeeded = 40 // 40 P1 to make 5 P2
      } else if (product.tier === 'P3') {
        inputsNeeded = 10 // 10 P2 to make 3 P3
      } else if (product.tier === 'P4') {
        // P4 items use different combinations - need to check the input tier
        if (inputData.tier === 'P3') {
          // P3 inputs to P4 use 6 units total, distributed among P3 inputs
          const p3InputCount = productDetails.inputs.filter(inp => {
            const data = piTypeIds[inp]
            return data && data.tier === 'P3'
          }).length
          inputsNeeded = 6 / p3InputCount
        } else if (inputData.tier === 'P1') {
          // P1 inputs to P4 use 40 units
          inputsNeeded = 40
        } else if (inputData.tier === 'P2') {
          // P2 inputs to P4 would use 10 units (though this is rare/non-existent)
          inputsNeeded = 10
        }
      }
      
      totalInputCost += inputPrices.buy * inputsNeeded
    }
    
    if (!hasAllPrices || totalInputCost === 0) return null
    
    // Calculate taxes
    const importTaxRate = 0.015 // 1.5% for imports
    const exportTaxRate = 0.03  // 3% for exports
    
    let totalImportTax = 0
    let totalExportTax = 0
    
    // Import and export taxes for inputs (tier below)
    for (const inputName of productDetails.inputs) {
      const inputData = piTypeIds[inputName]
      if (!inputData) continue
      
      const baseValue = piTaxValues[inputName] || 0
      
      let inputsNeeded = 1
      if (product.tier === 'P2') {
        inputsNeeded = 40
        // P1 inputs only have import tax
        totalImportTax += baseValue * inputsNeeded * importTaxRate
      } else if (product.tier === 'P3') {
        inputsNeeded = 10
        // P2 inputs have both import and export tax
        totalImportTax += baseValue * inputsNeeded * importTaxRate
        totalExportTax += baseValue * inputsNeeded * exportTaxRate
      } else if (product.tier === 'P4') {
        // P4 items use different combinations - need to check the input tier
        if (inputData.tier === 'P3') {
          const p3InputCount = productDetails.inputs.filter(inp => {
            const data = piTypeIds[inp]
            return data && data.tier === 'P3'
          }).length
          inputsNeeded = 6 / p3InputCount
          // P3 inputs have both import and export tax
          totalImportTax += baseValue * inputsNeeded * importTaxRate
          totalExportTax += baseValue * inputsNeeded * exportTaxRate
        } else if (inputData.tier === 'P1') {
          inputsNeeded = 40
          // P1 inputs only have import tax
          totalImportTax += baseValue * inputsNeeded * importTaxRate
        } else if (inputData.tier === 'P2') {
          inputsNeeded = 10
          // P2 inputs have both import and export tax
          totalImportTax += baseValue * inputsNeeded * importTaxRate
          totalExportTax += baseValue * inputsNeeded * exportTaxRate
        }
      }
    }
    
    // Export tax for output product
    const outputBaseValue = piTaxValues[product.name] || 0
    const outputExportTax = outputBaseValue * outputQuantity * exportTaxRate
    
    // Total costs including taxes
    const totalCost = totalInputCost + totalImportTax + totalExportTax + outputExportTax
    
    // Calculate profit
    const outputValue = productPrices.sell * outputQuantity
    const profit = outputValue - totalCost
    const profitPercentage = (profit / totalCost) * 100
    
    // Collect input details for tooltip
    const inputDetails = []
    for (const inputName of productDetails.inputs) {
      const inputData = piTypeIds[inputName]
      if (!inputData) continue
      
      const inputPrices = prices[inputData.typeId]
      if (!inputPrices) continue
      
      let inputsNeeded = 1
      if (product.tier === 'P2') {
        inputsNeeded = 40
      } else if (product.tier === 'P3') {
        inputsNeeded = 10
      } else if (product.tier === 'P4') {
        if (inputData.tier === 'P3') {
          const p3InputCount = productDetails.inputs.filter(inp => {
            const data = piTypeIds[inp]
            return data && data.tier === 'P3'
          }).length
          inputsNeeded = 6 / p3InputCount
        } else if (inputData.tier === 'P1') {
          inputsNeeded = 40
        } else if (inputData.tier === 'P2') {
          inputsNeeded = 10
        }
      }
      
      inputDetails.push({
        name: inputName,
        typeId: inputData.typeId,
        tier: inputData.tier,
        quantity: inputsNeeded,
        price: inputPrices.buy,
        cost: inputPrices.buy * inputsNeeded
      })
    }
    
    return {
      percentage: profitPercentage,
      inputDetails,
      totalInputCost,
      totalImportTax,
      totalExportTax,
      outputExportTax,
      totalCost,
      outputValue,
      outputQuantity,
      profit
    }
  }
  
  const tierBelowProfit = !pricesLoading ? calculateTierBelowToProductProfit() : null
  
  // Create tooltip content for crafting advantage
  const craftingAdvantageTooltip = craftingAdvantage && craftingAdvantage.details ? (
    <div className="tooltip-calculation">
      <h4>Crafting Advantage Calculation</h4>
      
      <div className="tooltip-section">
        <strong>Direct Trade Option:</strong>
        <div className="tooltip-item">
          <span>Buy {craftingAdvantage.details.directTradeVolume.toFixed(0)} m³ of {product.tier === 'P2' ? 'P1' : 'P2'} materials</span>
          <span className="tooltip-cost">{craftingAdvantage.details.directTradeBuyCost.toLocaleString()} ISK</span>
        </div>
        <div className="tooltip-item">
          <span>Sell in Jita</span>
          <span className="tooltip-value">{craftingAdvantage.details.directTradeSellValue.toLocaleString()} ISK</span>
        </div>
        <div className="tooltip-item">
          <span>Direct Trade Profit</span>
          <span className={craftingAdvantage.details.directTradeProfit > 0 ? 'tooltip-profit' : 'tooltip-loss'}>
            {craftingAdvantage.details.directTradeProfit.toLocaleString()} ISK
          </span>
        </div>
      </div>
      
      <div className="tooltip-section">
        <strong>Crafting Option:</strong>
        <div className="tooltip-item">
          <span>Input Cost</span>
          <span className="tooltip-cost">{craftingAdvantage.details.totalBuyCost.toLocaleString()} ISK</span>
        </div>
        <div className="tooltip-item">
          <span>Total Taxes</span>
          <span className="tooltip-cost">{craftingAdvantage.details.totalProductionTaxes.toLocaleString()} ISK</span>
        </div>
        <div className="tooltip-item">
          <span>Output Value ({craftingAdvantage.details.outputUnits} units)</span>
          <span className="tooltip-value">{craftingAdvantage.details.outputValue.toLocaleString()} ISK</span>
        </div>
        <div className="tooltip-item">
          <span>Crafting Profit</span>
          <span className={craftingAdvantage.details.profitWithTaxBuy > 0 ? 'tooltip-profit' : 'tooltip-loss'}>
            {craftingAdvantage.details.profitWithTaxBuy.toLocaleString()} ISK
          </span>
        </div>
      </div>
    </div>
  ) : null
  
  // Create tooltip content for tier below profit
  const tierBelowTooltip = tierBelowProfit && tierBelowProfit.inputDetails ? (
    <div className="tooltip-calculation">
      <h4>{product.name} Production from {product.tier === 'P2' ? 'P1' : product.tier === 'P3' ? 'P2' : 'Mixed'} Inputs</h4>
      
      <div className="tooltip-section">
        <strong>Inputs (Buy in Syndicate):</strong>
        {tierBelowProfit.inputDetails.map((input, idx) => (
          <div key={idx} className="tooltip-item">
            <img 
              src={`/icons/${input.typeId}.png`}
              alt={input.name}
              className="tooltip-icon"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <span className="tooltip-icon-fallback" style={{ display: 'none' }}>📦</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              {input.quantity} × {input.name}
            </span>
            <span className="tooltip-cost">{input.cost.toLocaleString()} ISK</span>
          </div>
        ))}
        <div className="tooltip-divider" />
        <div className="tooltip-item">
          <span>Total Input Cost</span>
          <span className="tooltip-cost">{tierBelowProfit.totalInputCost.toLocaleString()} ISK</span>
        </div>
      </div>
      
      <div className="tooltip-section">
        <strong>Taxes:</strong>
        <div className="tooltip-item">
          <span>Import Tax (1.5%)</span>
          <span className="tooltip-cost">{tierBelowProfit.totalImportTax.toLocaleString()} ISK</span>
        </div>
        {tierBelowProfit.totalExportTax > 0 && (
          <div className="tooltip-item">
            <span>Input Export Tax (3%)</span>
            <span className="tooltip-cost">{tierBelowProfit.totalExportTax.toLocaleString()} ISK</span>
          </div>
        )}
        <div className="tooltip-item">
          <span>Output Export Tax (3%)</span>
          <span className="tooltip-cost">{tierBelowProfit.outputExportTax.toLocaleString()} ISK</span>
        </div>
      </div>
      
      <div className="tooltip-section">
        <strong>Output (Sell in Jita):</strong>
        <div className="tooltip-item">
          <img 
            src={`/icons/${product.typeId}.png`}
            alt={product.name}
            className="tooltip-icon"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          <span className="tooltip-icon-fallback" style={{ display: 'none' }}>{product.icon || '📦'}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            {tierBelowProfit.outputQuantity} × {product.name}
          </span>
          <span className="tooltip-value">{tierBelowProfit.outputValue.toLocaleString()} ISK</span>
        </div>
      </div>
      
      <div className="tooltip-section">
        <div className="tooltip-item">
          <span><strong>Total Cost</strong></span>
          <span className="tooltip-cost">{tierBelowProfit.totalCost.toLocaleString()} ISK</span>
        </div>
        <div className="tooltip-item">
          <span><strong>Net Profit</strong></span>
          <span className={tierBelowProfit.profit > 0 ? 'tooltip-profit' : 'tooltip-loss'}>
            {tierBelowProfit.profit.toLocaleString()} ISK
          </span>
        </div>
      </div>
    </div>
  ) : null
  
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
        <td className={`tier-cell tier-${product.tier.toLowerCase()}`}>
          {product.tier}
        </td>
        <InputsCell inputs={product.inputs} />
        <td className="price-cell">
          {pricesLoading ? (
            <span className="price-loading">...</span>
          ) : (
            <PriceCell 
              price={prices[product.typeId]?.buy} 
              type="buy" 
              jitaBuyAvg={prices[product.typeId]?.jitaBuyAvg}
            />
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
            <Tooltip content={craftingAdvantageTooltip}>
              <span className={craftingAdvantage.percentage > 0 ? 'profit-positive' : 'profit-negative'}>
                {craftingAdvantage.percentage > 0 ? '+' : ''}{craftingAdvantage.percentage.toFixed(1)}%
              </span>
            </Tooltip>
          ) : (
            <span className="price-na">N/A</span>
          )}
        </td>
        <td className="profit-cell">
          {pricesLoading ? (
            <span className="price-loading">...</span>
          ) : tierBelowProfit !== null ? (
            <Tooltip content={tierBelowTooltip}>
              <span className={tierBelowProfit.percentage > 0 ? 'profit-positive' : 'profit-negative'}>
                {tierBelowProfit.percentage > 0 ? '+' : ''}{tierBelowProfit.percentage.toFixed(1)}%
              </span>
            </Tooltip>
          ) : (
            <span className="price-na">-</span>
          )}
        </td>
      </tr>
      
      {isExpanded && costAnalysis && (
        <tr className="expanded-details">
          <td colSpan="8">
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