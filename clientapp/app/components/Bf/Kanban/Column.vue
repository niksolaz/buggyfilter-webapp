<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { SortableEvent } from 'vue-draggable-plus'
import type { OperatorTicket, TicketStatus } from '~~/shared/types/ticket'

/**
 * BfKanbanColumn — colonna trascinabile del Kanban operatore.
 * Mantiene una copia locale della lista per il v-model di SortableJS;
 * la mutazione vera avviene nello store via evento `drop`.
 */
const props = defineProps<{
  status: TicketStatus
  label: string
  tickets: OperatorTicket[]
  /** Risoluzione nomi delegata al Board (la colonna resta presentazionale). */
  clientNameOf: (ticket: OperatorTicket) => string
  operatorNameOf: (ticket: OperatorTicket) => string
}>()

const emit = defineEmits<{
  /** Un ticket è stato spostato (drag o tastiera) in questa/altra colonna. */
  (e: 'drop', ticketId: number, status: TicketStatus): void
}>()

/** Copia locale per il drag&drop: si risincronizza quando lo store cambia. */
const localTickets = ref<OperatorTicket[]>([])
watch(() => props.tickets, list => (localTickets.value = [...list]), { immediate: true })

/** Un elemento è stato rilasciato QUI provenendo da un'altra colonna. */
function onAdd(event: SortableEvent) {
  const ticketId = Number(event.item?.dataset?.ticketId)
  if (ticketId) emit('drop', ticketId, props.status)
}
</script>

<template>
  <section
    class="flex w-72 shrink-0 flex-col rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-3"
    :aria-label="`Colonna ${label}, ${tickets.length} ticket`"
  >
    <header class="mb-3 flex items-center justify-between px-1">
      <h2 class="text-sm font-semibold text-[var(--color-text)]">
        {{ label }}
      </h2>
      <UBadge
        color="neutral"
        variant="soft"
        size="sm"
      >
        {{ tickets.length }}
      </UBadge>
    </header>

    <VueDraggable
      v-model="localTickets"
      group="bf-kanban"
      :animation="150"
      ghost-class="bf-drag-ghost"
      drag-class="bf-drag-active"
      class="flex min-h-32 flex-1 flex-col gap-2"
      @add="onAdd"
    >
      <div
        v-for="ticket in localTickets"
        :key="ticket.id"
        :data-ticket-id="ticket.id"
        class="cursor-grab active:cursor-grabbing"
      >
        <BfTicketCard
          :ticket="ticket"
          role="operator"
          compact
          :client-name="clientNameOf(ticket)"
          :operator-name="operatorNameOf(ticket)"
          @move="targetStatus => emit('drop', ticket.id, targetStatus)"
        />
      </div>
    </VueDraggable>

    <p
      v-if="!tickets.length"
      class="pointer-events-none -mt-28 px-4 pb-4 text-center text-xs text-[var(--color-text-muted)]"
    >
      Nessun ticket qui
    </p>
  </section>
</template>
