/**
 * Tiny id generator for app-layer entities. Lives in the app layer (the domain
 * stays free of randomness). Not cryptographic — fine for local row ids.
 */
let counter = 0;
export function id(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
