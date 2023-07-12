import { hubService } from '../global/hubService'
import { updateStanzaAuthToken } from '../global/authToken'

export async function fetchAuthToken (): Promise<string | null> {
  const authToken = await hubService.getAuthToken()

  authToken !== null && updateStanzaAuthToken(authToken)

  return authToken
}
