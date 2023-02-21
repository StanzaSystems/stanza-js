import Stanza from 'stanza-browser'
import { config } from '../stanzaConfig'

export async function initState (element: HTMLDivElement): Promise<void> {
  Stanza.init(config)
  const context = await Stanza.getContextHot('main')
  const text = new Text(JSON.stringify(context.features[0].message))
  element.replaceChildren(text)
}

export async function updateState (element: HTMLDivElement, message: string): Promise<void> {
  const text = new Text(JSON.stringify(message))
  element.replaceChildren(text)
}
