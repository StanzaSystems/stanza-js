// import state from './localStorageStateProvider'
// export default function stanzaWorker (): void {
//   self.postMessage('stanza_initialized')

//   self.onmessage = (ev) => {
//     console.log(ev)
//   }
// }

// self.postMessage('stanza_initialized')
import provider from './localStorageStateProvider'

export const onmessage = (ev: Event): void => {
  console.log(ev)
  const metadata = provider.GetMetadata()
  console.log(metadata)
}
