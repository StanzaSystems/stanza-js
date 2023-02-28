import React from 'react'
import ReactDOM from 'react-dom/client'
import StanzaBrowser from 'stanza-browser'
import { StanzaProvider } from 'stanza-react'
import { worker } from '../../../mocks/browser'
import App from './App'
import './index.css'
import { config } from './stanzaConfig'

StanzaBrowser.init(config)

let loadPromise: Promise<any>
if (process.env.NODE_ENV === 'development') {
  loadPromise = worker.start()
} else {
  loadPromise = Promise.resolve()
}

await loadPromise

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <StanzaProvider contextName="details">
      <App/>
    </StanzaProvider>
  </React.StrictMode>
)
