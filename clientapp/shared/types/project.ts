/**
 * Tipi progetto — rispecchiano Project e ProjectMember del backend Django.
 */

export interface Project {
  id: number
  name: string
  description: string
  created_at: string
}

/** Ruolo del membro all'interno del singolo progetto (ProjectMember.role_in_project). */
export type ProjectRole = 'ADMIN' | 'MEMBER' | 'VIEWER'

export interface ProjectMember {
  id: number
  project_id: number
  user_id: number
  role_in_project: ProjectRole
  joined_at: string
}

/**
 * Impostazioni di progetto usate per le stime di costo/fattura.
 * NOTA: campo solo-frontend per ora — in attesa di una colonna dedicata
 * sul modello Project del backend.
 */
export interface ProjectSettings {
  project_id: number
  /** Tariffa giornaliera in EUR usata per stimare costi e fattura. */
  daily_rate: number
}
