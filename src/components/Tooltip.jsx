import { useState, useRef, useEffect } from 'react'
import './Tooltip.css'

function Tooltip({ children, content }) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef(null)
  const targetRef = useRef(null)

  useEffect(() => {
    if (isVisible && tooltipRef.current && targetRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      
      // Position tooltip above the target element
      let top = targetRect.top - tooltipRect.height - 10
      let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2)
      
      // Adjust if tooltip goes off screen
      if (top < 10) {
        top = targetRect.bottom + 10
      }
      if (left < 10) {
        left = 10
      } else if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10
      }
      
      setPosition({ top, left })
    }
  }, [isVisible])

  return (
    <>
      <span
        ref={targetRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{ cursor: 'help' }}
      >
        {children}
      </span>
      {isVisible && content && (
        <div
          ref={tooltipRef}
          className="tooltip-popup"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
        </div>
      )}
    </>
  )
}

export default Tooltip