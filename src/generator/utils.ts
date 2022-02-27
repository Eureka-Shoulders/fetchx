export function toPascalCase(string: string) {
  return `${string}`
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w*)/, 'g'),
      ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
    )
    .replace(new RegExp(/\w/), (s) => s.toUpperCase());
}

export function getType(string: string) {
  const types: Record<string, string> = {
    string: 'string',
    integer: 'number',
    boolean: 'boolean',
  };

  return types[string] || 'unknown';
}
