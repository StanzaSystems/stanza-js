import { init } from 'stanza-browser'
import { config } from '../stanzaConfig'
export function setupCounter (element: HTMLButtonElement): void {
  let counter = 0
  const setCounter = (count: number): void => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  element.addEventListener('click', () => { setCounter(counter + 1) })
  setCounter(0)
}
// new Worker(new URL('./stanzaWorker.ts', import.meta.url), { type: 'module' })
export function renderState (element: HTMLDivElement): void {
  const state = init(config)
  const text = new Text(JSON.stringify(state))
  element.appendChild(text)
}
