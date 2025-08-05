import { useState } from 'react'

function IconCell({ typeId, name, fallbackIcon }) {
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Use local icon first, fallback to EVE server
  const localIconUrl = `/icons/${typeId}.png`
  const remoteIconUrl = `https://images.evetech.net/types/${typeId}/icon?size=64`
  const iconUrl = imageError ? remoteIconUrl : localIconUrl

  const handleImageLoad = () => {
    setLoading(false)
  }

  const handleImageError = () => {
    console.log(`Failed to load icon for ${name} (${typeId})`)
    setImageError(true)
    setLoading(false)
  }

  return (
    <td className="icon-cell">
      {!imageError ? (
        <div className="icon-wrapper">
          {loading && <div className="icon-loading">{fallbackIcon}</div>}
          <img 
            src={iconUrl}
            alt={name}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: loading ? 'none' : 'block' }}
            className="eve-icon"
          />
        </div>
      ) : (
        <span className="fallback-icon">{fallbackIcon}</span>
      )}
    </td>
  )
}

export default IconCell