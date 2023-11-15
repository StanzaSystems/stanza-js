export type StanzaGuardErrorReasons = 'NoQuota' | 'InvalidToken';

export class StanzaGuardError extends Error {
  constructor(
    public readonly reason: StanzaGuardErrorReasons,
    message: string
  ) {
    super(`${reason}: ${message}`);
  }
}
