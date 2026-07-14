<script setup lang="ts">
import type { OperatorTicket, TicketStatus } from '~~/shared/types/ticket'

/**
 * BfKanbanBoard — quattro colonne ToDo / In Progress / Review / Complete
 * (design doc §2.5). Il drop aggiorna lo store con update ottimistico;
 * il drop su Complete innesca il pattern "resolution loop" (§3.3):
 * il cliente viene notificato e le stime in Statistiche si aggiornano.
 */
const props = defineProps<{
  projectId: number
}>()

const ticketsStore = useTicketsStore()
const projectsStore = useProjectsStore()
const toast = useToast()

const ticketsByStatus = computed(() => {
  const groups: Record<TicketStatus, OperatorTicket[]> = { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] }
  for (const ticket of ticketsStore.byProject(props.projectId)) {
    groups[ticket.status].push(ticket)
  }
  return groups
})

function userName(userId: number | null): string {
  const user = projectsStore.orgUsers.find(u => u.id === userId)
  return user ? fullName(user) : ''
}

const clientNameOf = (ticket: OperatorTicket) => userName(ticket.client_id)
const operatorNameOf = (ticket: OperatorTicket) => userName(ticket.operator_id)

async function onDrop(ticketId: number, status: TicketStatus) {
  try {
    await ticketsStore.updateStatus(ticketId, status)
    if (status === 'DONE') {
      toast.add({
        title: 'Ticket risolto',
        description: 'Cliente notificato ✅ — stime aggiornate in Statistiche.',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
    }
  }
  catch {
    toast.add({
      title: 'Spostamento non riuscito',
      description: 'Riprova tra qualche istante.',
      color: 'error',
    })
  }
}
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-4">
    <BfKanbanColumn
      v-for="column in KANBAN_COLUMNS"
      :key="column.status"
      :status="column.status"
      :label="column.label"
      :tickets="ticketsByStatus[column.status]"
      :client-name-of="clientNameOf"
      :operator-name-of="operatorNameOf"
      @drop="onDrop"
    />
  </div>
</template>
