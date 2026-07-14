import { defineStore } from 'pinia'
import { ticketsService } from '~/services'
import type { OperatorTicket, TicketStatus } from '~~/shared/types/ticket'

/**
 * Store ticket con payload COMPLETO: da usare solo nelle superfici
 * operatore/owner. Il Client Portal usa useClientTickets, che riceve
 * il payload ridotto senza campi tecnici.
 */
export const useTicketsStore = defineStore('tickets', () => {
  const tickets = ref<OperatorTicket[]>([])
  const loaded = ref(false)

  async function fetchAll(force = false) {
    if (loaded.value && !force) return
    tickets.value = await ticketsService.fetchOperatorTickets()
    loaded.value = true
  }

  const byProject = computed(() =>
    (projectId: number) => tickets.value.filter(t => t.project_id === projectId),
  )

  /** Conteggi per stato di un progetto (card della dashboard operatore). */
  const countsByStatus = computed(() => (projectId: number) => {
    const counts: Record<TicketStatus, number> = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 }
    for (const t of byProject.value(projectId)) counts[t.status]++
    return counts
  })

  /**
   * Transizione di stato con update ottimistico: la UI si aggiorna subito
   * (drag&drop fluido), il service conferma; in caso di errore si fa rollback.
   */
  async function updateStatus(ticketId: number, status: TicketStatus) {
    const ticket = tickets.value.find(t => t.id === ticketId)
    if (!ticket || ticket.status === status) return
    const previous = ticket.status
    ticket.status = status
    ticket.updated_at = new Date().toISOString()
    try {
      await ticketsService.updateTicketStatus(ticketId, status)
    }
    catch (error) {
      ticket.status = previous
      throw error
    }
  }

  return { tickets, loaded, fetchAll, byProject, countsByStatus, updateStatus }
})
