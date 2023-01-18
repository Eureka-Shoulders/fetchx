export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  return value?.constructor === Object;
}
