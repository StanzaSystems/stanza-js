import * as crypto from 'crypto'

export const generateClientId = (): string => {
  try {
    return crypto.randomUUID()
  } catch {
    return ''
  }
}
