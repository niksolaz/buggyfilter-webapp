<script setup lang="ts">
import type { TicketStatus } from '~~/shared/types/ticket'

/**
 * BfStatusBadge — badge di stato con label per ruolo (design doc §2.3):
 * il cliente vede il linguaggio semplificato ("In coda", "Risolto"),
 * l'operatore la label tecnica ("Todo", "Done").
 */
const props = withDefaults(defineProps<{
  status: TicketStatus
  role?: 'client' | 'operator'
}>(), {
  role: 'client',
})

const label = computed(() =>
  props.role === 'client'
    ? CLIENT_STATUS_LABELS[props.status]
    : OPERATOR_STATUS_LABELS[props.status],
)

const color = computed(() => STATUS_COLORS[props.status])
</script>

<template>
  <UBadge
    :color="color"
    variant="subtle"
    size="sm"
    :aria-label="`Stato: ${label}`"
  >
    <span
      class="inline-block size-1.5 rounded-full bg-current"
      aria-hidden="true"
    />
    {{ label }}
  </UBadge>
</template>
