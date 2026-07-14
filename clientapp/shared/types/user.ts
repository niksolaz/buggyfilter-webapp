/**
 * Tipi utente/organizzazione — rispecchiano serverapp/tickets/models.py.
 */

/** Ruolo globale dell'utente (User.role nel backend Django). */
export type Role = 'CLIENT' | 'OPERATOR' | 'OWNER'

export interface Organization {
  id: number
  name: string
  created_at: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: Role
  organization_id: number | null
}
