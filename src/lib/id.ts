export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback – not cryptographically strong, but stable enough for IDs.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}


