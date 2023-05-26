/* eslint-disable @typescript-eslint/no-non-null-assertion */
import './style.css'
import StanzaBrowser from '@getstanza/browser'
import { initState, updateState } from './stanzaState'
// import { worker } from '../../../mocks/browser'

let loadPromise: Promise<any>

if (import.meta.env.MODE === 'development') {
  loadPromise = Promise.resolve()// worker.start()
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

StanzaBrowser.contextChanges.addChangeListener(async function (change) {
  if (change.name !== 'main') {
    return
  }
  const context = change
  // TODO: FIX - this seems to trigger the request to hub instead of just using cached values
  // const context = await StanzaBrowser.getContext('main')
  const text = context.features.search.message ?? ''
  await updateState(document.querySelector<HTMLDivElement>('#stanzaState')!, text)
  void new Notification('Status Notifications', { body: text })
})
