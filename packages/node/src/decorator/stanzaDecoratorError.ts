export type StanzaDecoratorErrorReasons = 'NoQuota' | 'InvalidToken'

export class StanzaDecoratorError extends Error {
  constructor (public readonly reason: StanzaDecoratorErrorReasons, message: string) {
    super(`${reason}: ${message}`)
  }
}
