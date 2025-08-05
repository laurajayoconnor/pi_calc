function PriceCell({ price, type }) {
  if (price === null || price === undefined) {
    return <span className="price-na">-</span>
  }

  const formatted = price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  return (
    <span className={`price-${type}`}>
      {formatted} ISK
    </span>
  )
}

export default PriceCell