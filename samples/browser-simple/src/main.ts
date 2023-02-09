/* eslint-disable @typescript-eslint/no-non-null-assertion */
import './style.css'
import { initState } from './stanzaState'
import { worker } from '../../../mocks/browser'

let loadPromise: Promise<any>
if (process.env.NODE_ENV === 'development') {
  loadPromise = worker.start()
} else {
  loadPromise = Promise.resolve()
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Stanza Basics</h1>
    <div class="card" id="stanzaState">
    </div>
  </div>
`

loadPromise.then(() => { initState(document.querySelector<HTMLDivElement>('#stanzaState')!) }).catch(() => { console.log('mock service worker failed to load') })
