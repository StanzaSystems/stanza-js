// import state from './localStorageStateProvider'

self.postMessage('stanza_initialized')

self.onmessage = (ev) => {
  console.log(ev)
}

export {}
