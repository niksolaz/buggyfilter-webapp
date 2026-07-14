import { fakeLatency } from './delay'
import { projects, projectMembers, projectSettings } from '~/mocks/projects'
import { users } from '~/mocks/users'
import type { Project, ProjectMember, ProjectRole, ProjectSettings } from '~~/shared/types/project'
import type { User } from '~~/shared/types/user'

/**
 * Servizio progetti MOCK: firma allineata ai futuri endpoint Django
 * (GET /api/projects, GET /api/projects/:id/members, PATCH member, ...).
 * Le mutazioni scrivono sulle fixtures condivise per simulare la persistenza
 * all'interno della sessione.
 */

export async function fetchProjects(): Promise<Project[]> {
  await fakeLatency()
  return projects.map(p => ({ ...p }))
}

export async function fetchMembers(): Promise<ProjectMember[]> {
  await fakeLatency()
  return projectMembers.map(m => ({ ...m }))
}

export async function fetchOrganizationUsers(): Promise<User[]> {
  await fakeLatency()
  return users.map(u => ({ ...u }))
}

export async function fetchSettings(): Promise<ProjectSettings[]> {
  await fakeLatency()
  return projectSettings.map(s => ({ ...s }))
}

export async function updateMemberRole(memberId: number, role: ProjectRole): Promise<ProjectMember> {
  await fakeLatency()
  const member = projectMembers.find(m => m.id === memberId)
  if (!member) throw new Error('Membro non trovato')
  member.role_in_project = role
  return { ...member }
}

export async function addMember(projectId: number, userId: number, role: ProjectRole): Promise<ProjectMember> {
  await fakeLatency()
  if (projectMembers.some(m => m.project_id === projectId && m.user_id === userId)) {
    throw new Error('L\'utente fa già parte del progetto')
  }
  const member: ProjectMember = {
    id: Math.max(...projectMembers.map(m => m.id)) + 1,
    project_id: projectId,
    user_id: userId,
    role_in_project: role,
    joined_at: new Date().toISOString(),
  }
  projectMembers.push(member)
  return { ...member }
}

export async function updateDailyRate(projectId: number, dailyRate: number): Promise<ProjectSettings> {
  await fakeLatency()
  const settings = projectSettings.find(s => s.project_id === projectId)
  if (!settings) throw new Error('Impostazioni non trovate')
  settings.daily_rate = dailyRate
  return { ...settings }
}

/** Genera un link di invito finto (il backend genererà un token reale). */
export async function createInviteLink(projectId: number): Promise<string> {
  await fakeLatency()
  return `https://buggyfilter.app/invite/${projectId}-${crypto.randomUUID()}`
}
