import { piTypeIds } from '../data/piTypeIds'

function InputsCell({ inputs }) {
  if (!inputs || inputs.length === 0) {
    return <td className="inputs-cell">-</td>
  }

  return (
    <td className="inputs-cell">
      <div className="inputs-list">
        {inputs.map((input, index) => {
          const inputData = piTypeIds[input]
          return (
            <div key={index} className="input-item">
              {inputData && (
                <>
                  <img 
                    src={`/icons/${inputData.typeId}.png`}
                    alt={input}
                    className="input-icon"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'inline'
                    }}
                  />
                  <span className="input-icon-fallback" style={{ display: 'none' }}>
                    {inputData.icon}
                  </span>
                </>
              )}
              <span className="input-name">{input}</span>
            </div>
          )
        })}
      </div>
    </td>
  )
}

export default InputsCell