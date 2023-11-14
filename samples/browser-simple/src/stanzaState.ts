import Stanza from '@getstanza/browser'
import { config } from './stanzaConfig'

export async function initState(element: HTMLDivElement): Promise<void> {
  Stanza.init(config)
  const context = await Stanza.getContext('main')
  const text = new Text(JSON.stringify(context.features.search.message))
  element.replaceChildren(text)
}

export async function updateState(
  element: HTMLDivElement,
  message: string
): Promise<void> {
  const text = new Text(JSON.stringify(message))
  element.replaceChildren(text)
}
