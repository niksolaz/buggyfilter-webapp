<script setup lang="ts">
import type { ClientTicket, OperatorTicket, TicketStatus } from '~~/shared/types/ticket'

/**
 * BfTicketCard — componente cardine (design doc §2.2).
 *
 * La card cambia forma in base al ruolo: nella variante `client` i nodi
 * dei campi tecnici (severity, stima, AI) NON esistono nel markup — non
 * sono nascosti via CSS. La variante client riceve peraltro un payload
 * ClientTicket che quei campi non li contiene proprio.
 */
const props = withDefaults(defineProps<{
  ticket: ClientTicket | OperatorTicket
  role?: 'client' | 'operator'
  /** Versione ridotta per liste/Kanban. */
  compact?: boolean
  /** Nomi risolti dal chiamante (la card resta scollegata dagli store). */
  clientName?: string
  operatorName?: string
}>(), {
  role: 'client',
  compact: false,
  clientName: '',
  operatorName: '',
})

const emit = defineEmits<{
  /** Alternativa da tastiera al drag&drop (solo operator). */
  (e: 'move', status: TicketStatus): void
}>()

/** Payload completo, disponibile solo quando la card è in variante operator. */
const operatorTicket = computed(() =>
  props.role === 'operator' ? (props.ticket as OperatorTicket) : null,
)

/** Voci del menu "Sposta in…" (stati diversi da quello corrente). */
const moveItems = computed(() =>
  KANBAN_COLUMNS
    .filter(c => c.status !== props.ticket.status)
    .map(c => ({
      label: c.label,
      onSelect: () => emit('move', c.status),
    })),
)
</script>

<template>
  <!-- ═══ Variante OPERATOR: densa, con campi tecnici ═══ -->
  <article
    v-if="operatorTicket"
    class="group rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-sm transition hover:border-[var(--color-brand-500)] hover:shadow-md"
  >
    <div class="flex items-start justify-between gap-2">
      <h3 class="text-sm font-semibold leading-snug text-[var(--color-text)]">
        <span class="mr-1 font-mono text-xs text-[var(--color-text-muted)]">#{{ operatorTicket.id }}</span>
        {{ operatorTicket.title }}
      </h3>
      <BfSeverityBadge
        v-if="operatorTicket.severity"
        :severity="operatorTicket.severity"
        class="shrink-0"
      />
    </div>

    <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
      <span
        v-if="clientName"
        class="inline-flex items-center gap-1"
      >
        <UIcon
          name="i-lucide-building-2"
          aria-hidden="true"
        /> {{ clientName }}
      </span>
      <span
        v-if="operatorTicket.estimated_hours"
        class="inline-flex items-center gap-1"
      >
        <UIcon
          name="i-lucide-timer"
          aria-hidden="true"
        /> {{ operatorTicket.estimated_hours }}h
      </span>
      <span
        v-if="operatorName"
        class="inline-flex items-center gap-1"
      >
        <UIcon
          name="i-lucide-user"
          aria-hidden="true"
        /> {{ operatorName }}
      </span>
      <span
        v-if="operatorTicket.message_count"
        class="inline-flex items-center gap-1"
      >
        <UIcon
          name="i-lucide-message-circle"
          aria-hidden="true"
        /> {{ operatorTicket.message_count }}
      </span>
    </div>

    <!-- Brief AI (nascosto nella versione compact per non appesantire il Kanban) -->
    <div
      v-if="!compact && operatorTicket.ai_solution"
      class="mt-2 rounded-[var(--radius-sm)] bg-[var(--color-brand-50)] p-2 font-mono text-xs leading-relaxed text-[var(--color-text)]"
    >
      <span class="font-sans font-semibold">🤖 Brief AI</span><br>
      {{ operatorTicket.ai_solution }}
    </div>

    <div class="mt-2 flex items-center justify-between">
      <BfStatusBadge
        :status="operatorTicket.status"
        role="operator"
      />
      <!-- Alternativa da tastiera al drag&drop (a11y, design doc §2.5) -->
      <UDropdownMenu :items="moveItems">
        <UButton
          icon="i-lucide-move-right"
          size="xs"
          color="neutral"
          variant="ghost"
          label="Sposta"
          :aria-label="`Sposta il ticket ${operatorTicket.title} in un'altra colonna`"
        />
      </UDropdownMenu>
    </div>
  </article>

  <!-- ═══ Variante CLIENT: rassicurante, NESSUN campo tecnico nel markup ═══ -->
  <article
    v-else
    class="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-sm"
  >
    <h3 class="text-sm font-semibold leading-snug text-[var(--color-text)]">
      🐞 {{ ticket.title }}
    </h3>
    <p class="mt-1 text-xs text-[var(--color-text-muted)]">
      Aperto {{ timeAgo(ticket.created_at) }} · Aggiornato {{ timeAgo(ticket.updated_at) }}
    </p>
    <div class="mt-3 flex items-center justify-between">
      <BfStatusBadge
        :status="ticket.status"
        role="client"
      />
      <span
        v-if="ticket.message_count"
        class="text-xs text-[var(--color-text-muted)]"
      >
        💬 {{ ticket.message_count }} messaggi
      </span>
    </div>
    <div
      v-if="ticket.attachments.length"
      class="mt-2 flex gap-2"
    >
      <img
        v-for="attachment in ticket.attachments"
        :key="attachment.id"
        :src="attachment.url"
        :alt="attachment.name"
        class="size-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] object-cover"
      >
    </div>
  </article>
</template>
