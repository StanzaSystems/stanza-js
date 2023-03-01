import React from 'react'
import ReactDOM from 'react-dom/client'
import { createStanzaInstance, StanzaProvider } from 'stanza-react'
import { worker } from '../../../mocks/browser'
import App from './App'
import './index.css'
import { config } from './stanzaConfig'

let loadPromise: Promise<any>
if (process.env.NODE_ENV === 'development') {
  loadPromise = worker.start()
} else {
  loadPromise = Promise.resolve()
}

await loadPromise

const stanzaInstance = createStanzaInstance(config)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <StanzaProvider instance={stanzaInstance}>
      <App/>
    </StanzaProvider>
  </React.StrictMode>
)
