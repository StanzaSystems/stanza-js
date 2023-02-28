import { useContext } from 'react'
import { StanzaContext } from 'stanza-react'
import './App.css'

function App () {
  const context = useContext(StanzaContext)
  return (
    <div className="App">
      <h1>Vite + React</h1>
      <pre>
        {JSON.stringify(context, undefined, 2)}
      </pre>
    </div>
  )
}

export default App
