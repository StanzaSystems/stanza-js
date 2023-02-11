
interface Feature {
  name: string
  code: FeatureStatusCode
  message?: string | undefined
}

enum FeatureStatusCode {
  HEALTHY = 'HEALTHY',
  DEGRADED_NO_ERROR = 'DEGRADED_NO_ERROR',
  DEGRADED_ERROR = 'DEGRADED_ERROR',
  OUTAGE_ERROR = 'OUTAGE_ERROR',
  OUTAGE_REMOVE = 'OUTAGE_REMOVE'
}

function validateFeature (f: Feature): void {
  if (!Object.values(FeatureStatusCode).includes(f.code)) {
    throw new Error(`Error: invalid status for feature ${f.name}`)
  }
}

export type { Feature }
export { FeatureStatusCode, validateFeature }
