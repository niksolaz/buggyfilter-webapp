import type { Organization, User } from '~~/shared/types/user'

/**
 * Fixtures deterministiche di utenti e organizzazioni.
 * Tutti gli utenti seedati accettano la password mock `demo` (vedi auth.service).
 */

export const organizations: Organization[] = [
  { id: 1, name: 'BuggyFilter Studio', created_at: '2025-09-01T09:00:00Z' },
]

export const users: User[] = [
  {
    id: 1,
    username: 'mario.rossi',
    email: 'operator@buggyfilter.dev',
    first_name: 'Mario',
    last_name: 'Rossi',
    role: 'OPERATOR',
    organization_id: 1,
  },
  {
    id: 2,
    username: 'giulia.bianchi',
    email: 'giulia@buggyfilter.dev',
    first_name: 'Giulia',
    last_name: 'Bianchi',
    role: 'OPERATOR',
    organization_id: 1,
  },
  {
    id: 3,
    username: 'nicola.owner',
    email: 'owner@buggyfilter.dev',
    first_name: 'Nicola',
    last_name: 'Solazzo',
    role: 'OWNER',
    organization_id: 1,
  },
  {
    id: 4,
    username: 'laura.verdi',
    email: 'client@acme.com',
    first_name: 'Laura',
    last_name: 'Verdi',
    role: 'CLIENT',
    organization_id: 1,
  },
  {
    id: 5,
    username: 'paolo.neri',
    email: 'paolo@betasrl.it',
    first_name: 'Paolo',
    last_name: 'Neri',
    role: 'CLIENT',
    organization_id: 1,
  },
  {
    id: 6,
    username: 'anna.russo',
    email: 'anna@gammastore.it',
    first_name: 'Anna',
    last_name: 'Russo',
    role: 'CLIENT',
    organization_id: 1,
  },
]
