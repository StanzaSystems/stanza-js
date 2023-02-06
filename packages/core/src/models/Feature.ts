
interface Feature {
  Name: string
  Status: FeatureStatus
  ErrorMessage?: string | undefined
}

enum FeatureStatus {
  DEGRADED_NO_ERROR = 'DEGRADED_NO_ERROR',
  DEGRADED_ERROR = 'DEGRADED_ERROR',
  OUTAGE_ERROR = 'OUTAGE_ERROR',
  OUTAGE_REMOVE = 'OUTAGE_REMOVE'
}

function validateFeature (f: Feature): void {
  if (!Object.values(FeatureStatus).includes(f.Status)) {
    throw new Error(`Error: invalid status for feature ${f.Name}`)
  }
}

export type { Feature }
export { FeatureStatus, validateFeature }
