import Stanza from 'stanza-browser'
import { config } from '../stanzaConfig'

export async function initState (element: HTMLDivElement): Promise<void> {
  Stanza.init(config)
  const state = await Stanza.getGroupStateHot('main')
  const text = new Text(JSON.stringify(state))
  element.appendChild(text)
}
