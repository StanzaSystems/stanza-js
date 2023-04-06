export const generateClientId = (): string => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto')
    return crypto.randomUUID()
  } catch {
    return ''
  }
}
