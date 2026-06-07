export function pick<T>(values: readonly T[], index: number): T {
  const value = values[index % values.length]
  if (value === undefined) {
    throw new Error("Expected a non-empty value list")
  }
  return value
}
