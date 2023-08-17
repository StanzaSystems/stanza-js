type MapValueFn<V, R> = (value: V) => R

export function groupBy<V extends Record<K, string>, K extends string, R = V> (key: K, mapValue: MapValueFn<V, R>) {
  return (grouped: Record<V[K], R>, value: V) => {
    const valueElement = value[key]
    grouped[valueElement] = mapValue(value)
    return grouped
  }
}
