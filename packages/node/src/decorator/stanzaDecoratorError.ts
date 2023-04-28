const StanzaDecoratorErrorReasonsValues = ['TooManyRequests'] as const

export type StanzaDecoratorErrorReasons = (typeof StanzaDecoratorErrorReasonsValues)[number]

export class StanzaDecoratorError extends Error {
  constructor (public readonly reason: StanzaDecoratorErrorReasons, message: string) {
    super(`${reason}: ${message}`)
  }
}
