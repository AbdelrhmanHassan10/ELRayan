/** Resolve a localized name that may be a plain string or a {ar, en, ...} object */
export function resolveName(n: any): string {
  if (!n) return ''
  if (typeof n === 'string') return n
  return n?.ar || n?.en || Object.values(n)[0] as string || ''
}
