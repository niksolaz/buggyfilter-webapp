import { defineStore } from 'pinia'
import { projectsService } from '~/services'
import type { Project, ProjectMember, ProjectRole, ProjectSettings } from '~~/shared/types/project'
import type { User } from '~~/shared/types/user'

/** Membro di progetto arricchito con i dati utente (join lato client). */
export interface MemberWithUser extends ProjectMember {
  user: User
}

/**
 * Store progetti: progetti, membri, utenti dell'organizzazione e
 * impostazioni (dailyRate). La tariffa alimenta i getters costo dello
 * store tickets tramite useStats.
 */
export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const members = ref<ProjectMember[]>([])
  const orgUsers = ref<User[]>([])
  const settings = ref<ProjectSettings[]>([])
  const loaded = ref(false)

  /** Carica tutto una volta sola (idempotente). */
  async function fetchAll(force = false) {
    if (loaded.value && !force) return
    const [p, m, u, s] = await Promise.all([
      projectsService.fetchProjects(),
      projectsService.fetchMembers(),
      projectsService.fetchOrganizationUsers(),
      projectsService.fetchSettings(),
    ])
    projects.value = p
    members.value = m
    orgUsers.value = u
    settings.value = s
    loaded.value = true
  }

  const projectById = computed(() =>
    (id: number) => projects.value.find(p => p.id === id),
  )

  /** Membri di un progetto con i dati utente joinati. */
  const membersOf = computed(() => (projectId: number): MemberWithUser[] =>
    members.value
      .filter(m => m.project_id === projectId)
      .flatMap((m) => {
        const user = orgUsers.value.find(u => u.id === m.user_id)
        return user ? [{ ...m, user }] : []
      }),
  )

  const clientsOf = computed(() => (projectId: number) =>
    membersOf.value(projectId).filter(m => m.user.role === 'CLIENT'),
  )

  /** Operatori dell'organizzazione non ancora membri del progetto. */
  const availableOperators = computed(() => (projectId: number) =>
    orgUsers.value.filter(u =>
      (u.role === 'OPERATOR' || u.role === 'OWNER')
      && !members.value.some(m => m.project_id === projectId && m.user_id === u.id),
    ),
  )

  const dailyRateOf = computed(() => (projectId: number) =>
    settings.value.find(s => s.project_id === projectId)?.daily_rate ?? 400,
  )

  async function updateMemberRole(memberId: number, role: ProjectRole) {
    const updated = await projectsService.updateMemberRole(memberId, role)
    const idx = members.value.findIndex(m => m.id === memberId)
    if (idx !== -1) members.value[idx] = updated
  }

  async function addOperator(projectId: number, userId: number, role: ProjectRole = 'MEMBER') {
    const member = await projectsService.addMember(projectId, userId, role)
    members.value.push(member)
  }

  async function setDailyRate(projectId: number, rate: number) {
    const updated = await projectsService.updateDailyRate(projectId, rate)
    const idx = settings.value.findIndex(s => s.project_id === projectId)
    if (idx !== -1) settings.value[idx] = updated
    else settings.value.push(updated)
  }

  async function createInviteLink(projectId: number) {
    return projectsService.createInviteLink(projectId)
  }

  return {
    projects,
    members,
    orgUsers,
    settings,
    loaded,
    fetchAll,
    projectById,
    membersOf,
    clientsOf,
    availableOperators,
    dailyRateOf,
    updateMemberRole,
    addOperator,
    setDailyRate,
    createInviteLink,
  }
})
