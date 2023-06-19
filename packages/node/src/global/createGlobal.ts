export const createGlobal = <S extends string | symbol, T>(s: S, createFn: () => T): T => {
  type WithGlobalT = Record<S, T | undefined>
  const typedGlobalThis = globalThis as WithGlobalT
  const value = typedGlobalThis[s] = typedGlobalThis[s] ?? createFn()
  return value
}
