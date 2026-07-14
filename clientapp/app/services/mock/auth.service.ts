import { fakeLatency } from './delay'
import { users } from '~/mocks/users'
import type { User } from '~~/shared/types/user'

/**
 * Servizio auth MOCK: firma allineata ai futuri endpoint Django
 * (POST /api/auth/login, POST /api/auth/register).
 * Tutti gli utenti seedati accettano la password `demo`.
 */

const MOCK_PASSWORD = 'demo'

export interface RegisterInput {
  email: string
  password: string
  phone: string
  location: string
}

export async function login(email: string, password: string): Promise<User> {
  await fakeLatency()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user || password !== MOCK_PASSWORD) {
    throw new Error('Credenziali non valide')
  }
  return { ...user }
}

export async function register(input: RegisterInput): Promise<void> {
  await fakeLatency()
  if (users.some(u => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('Esiste già un account con questa email')
  }
  // Mock: non persistiamo il nuovo utente, il flusso si ferma alla conferma UI.
}
