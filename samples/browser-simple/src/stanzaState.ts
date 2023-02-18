import Stanza from 'stanza-browser'
import { config } from '../stanzaConfig'

export async function initState (element: HTMLDivElement): Promise<void> {
  Stanza.init(config)
  const context = await Stanza.getContextHot('main')
  const text = new Text(JSON.stringify(context))
  element.appendChild(text)
}
