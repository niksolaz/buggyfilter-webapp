import type { Project, ProjectMember, ProjectSettings } from '~~/shared/types/project'

/** Fixtures deterministiche di progetti, membri e impostazioni. */

export const projects: Project[] = [
  {
    id: 1,
    name: 'webapp-acme',
    description: 'Portale web ACME: area riservata clienti e checkout.',
    created_at: '2025-10-05T10:00:00Z',
  },
  {
    id: 2,
    name: 'ecommerce-beta',
    description: 'E-commerce Beta Srl su Nuxt + Stripe.',
    created_at: '2025-11-12T14:30:00Z',
  },
  {
    id: 3,
    name: 'gamma-store-mobile',
    description: 'App mobile ibrida per Gamma Store, sincronizzata col gestionale.',
    created_at: '2026-01-20T09:15:00Z',
  },
]

export const projectMembers: ProjectMember[] = [
  // webapp-acme: Mario (admin), Giulia, cliente Laura
  { id: 1, project_id: 1, user_id: 1, role_in_project: 'ADMIN', joined_at: '2025-10-05T10:00:00Z' },
  { id: 2, project_id: 1, user_id: 2, role_in_project: 'MEMBER', joined_at: '2025-10-06T09:00:00Z' },
  { id: 3, project_id: 1, user_id: 4, role_in_project: 'VIEWER', joined_at: '2025-10-07T16:00:00Z' },
  // ecommerce-beta: Giulia (admin), cliente Paolo
  { id: 4, project_id: 2, user_id: 2, role_in_project: 'ADMIN', joined_at: '2025-11-12T14:30:00Z' },
  { id: 5, project_id: 2, user_id: 5, role_in_project: 'VIEWER', joined_at: '2025-11-13T10:00:00Z' },
  // gamma-store-mobile: Mario (admin), Giulia, cliente Anna
  { id: 6, project_id: 3, user_id: 1, role_in_project: 'ADMIN', joined_at: '2026-01-20T09:15:00Z' },
  { id: 7, project_id: 3, user_id: 2, role_in_project: 'MEMBER', joined_at: '2026-01-21T11:00:00Z' },
  { id: 8, project_id: 3, user_id: 6, role_in_project: 'VIEWER', joined_at: '2026-01-22T12:00:00Z' },
]

/** Tariffa giornaliera di default: 400 EUR/giorno (modificabile in Settings). */
export const projectSettings: ProjectSettings[] = [
  { project_id: 1, daily_rate: 400 },
  { project_id: 2, daily_rate: 480 },
  { project_id: 3, daily_rate: 350 },
]
