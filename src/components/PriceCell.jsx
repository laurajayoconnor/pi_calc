function PriceCell({ price, type, jitaBuyAvg = null }) {
  if (price === null || price === undefined) {
    return <span className="price-na">-</span>
  }

  const formatted = price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  // For buy prices, show comparison with Jita buy average
  if (type === 'buy' && jitaBuyAvg !== null) {
    const jitaFormatted = jitaBuyAvg.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    
    // Calculate percentage difference (how much cheaper Syndicate is than Jita)
    const percentageDiff = ((jitaBuyAvg - price) / jitaBuyAvg * 100).toFixed(1)
    const isCheaper = price < jitaBuyAvg
    
    return (
      <div className="price-comparison">
        <span className={`price-${type}`}>
          {formatted} ISK
        </span>
        <span className="price-jita-comparison">
          Jita 5d avg: {jitaFormatted} ISK
          <span className={`price-diff ${isCheaper ? 'cheaper' : 'expensive'}`}>
            ({isCheaper ? '-' : '+'}{Math.abs(percentageDiff)}%)
          </span>
        </span>
      </div>
    )
  }

  return (
    <span className={`price-${type}`}>
      {formatted} ISK
    </span>
  )
}

export default PriceCell