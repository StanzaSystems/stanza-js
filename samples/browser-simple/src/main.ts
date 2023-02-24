/* eslint-disable @typescript-eslint/no-non-null-assertion */
import './style.css'
import { initState, updateState } from './stanzaState'
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

loadPromise.then(() => { void initState(document.querySelector<HTMLDivElement>('#stanzaState')!) }).catch(() => { console.log('mock service worker failed to load') })
void Notification.requestPermission().then((result) => {
  console.log(result)
})

self.onmessage = async function (m) {
  const text = m.data.features[0].message
  await updateState(document.querySelector<HTMLDivElement>('#stanzaState')!, text)
  void new Notification('Status Notifications', { body: text })
}
