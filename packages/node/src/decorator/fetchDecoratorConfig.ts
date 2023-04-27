import { updateDecoratorConfig } from '../global/decoratorConfig'
import { hubService } from '../global/hubService'
import { type FetchDecoratorConfigOptions } from '../hub/hubService'

export async function fetchDecoratorConfig (options: FetchDecoratorConfigOptions) {
  const response = await hubService.fetchDecoratorConfig(options)

  console.log('##### decorator response', response)
  response !== null && updateDecoratorConfig(options.decorator, response)

  return response
}
