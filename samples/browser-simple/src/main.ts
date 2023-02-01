/* eslint-disable @typescript-eslint/no-non-null-assertion */
import './style.css'
import { setupCounter, renderState } from './counter'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <div class="card" id="stanzaState">

    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
renderState(document.querySelector<HTMLDivElement>('#stanzaState')!)
