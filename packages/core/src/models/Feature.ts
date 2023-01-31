
interface Feature {
  Name: string
  Status: FeatureStatus
  ErrorMessage?: string | undefined
}

enum FeatureStatus {
  DEGRADED = 'DEGRADED',
  FAIL_NO_SEND = 'FAIL_NO_SEND',
  FAIL_SEND = 'FAIL_SEND',
  FAIL_REMOVE = 'FAIL_REMOVE'
}

function validateFeature (f: Feature): void {
  if (!Object.values(FeatureStatus).includes(f.Status)) {
    throw new Error(`Error: invalid status for feature ${f.Name}`)
  }
}

export type { Feature }
export { FeatureStatus, validateFeature }
