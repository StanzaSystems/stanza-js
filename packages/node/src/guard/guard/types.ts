export type CheckerResponse<
  TType extends string,
  TSuccess = Record<string, unknown>,
  TFailure = Record<string, unknown>,
  TFailOpen = Record<string, unknown>
> = { type: TType } & (
  | ({ status: 'success' } & TSuccess)
  | ({ status: 'failure' } & TFailure)
  | ({ status: 'failOpen' } & TFailOpen)
  | { status: 'disabled' }
)
