/** Simula la latenza di rete del futuro backend (150–400ms). */
export function fakeLatency(): Promise<void> {
  const ms = 150 + Math.random() * 250
  return new Promise(resolve => setTimeout(resolve, ms))
}
