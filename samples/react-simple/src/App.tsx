import { useStanzaContext } from '@getstanza/react'
import './App.css'

let renderCount = 0
function App() {
  const context = useStanzaContext('main')
  return (
    <div className='App'>
      <h1>Vite + React</h1>
      <div>Render count: {++renderCount}</div>
      <pre>{JSON.stringify(context, undefined, 2)}</pre>
    </div>
  )
}

export default App
