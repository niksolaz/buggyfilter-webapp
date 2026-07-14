<script setup lang="ts">
/**
 * Dashboard Cliente: due colonne — "In coda" (tutto ciò che non è risolto)
 * e "Risolto". I nuovi ticket si creano SOLO tramite il chatbot; una volta
 * inviati il cliente non può più modificarli (nessuna affordance di edit).
 *
 * Sicurezza: questa pagina lavora su ClientTicket — severity, stime e
 * brief AI non arrivano nemmeno nel payload (vedi useClientTickets).
 */
definePageMeta({
  layout: 'client',
  middleware: 'role',
  roles: ['CLIENT'],
})
useHead({ title: 'I tuoi ticket' })

const auth = useAuthStore()
const projectsStore = useProjectsStore()
const { openTickets, resolvedTickets, loading, fetch } = useClientTickets()

await Promise.all([fetch(), projectsStore.fetchAll()])

/** Progetto di appartenenza del cliente (primo progetto di cui è membro). */
const clientProjectId = computed(() =>
  projectsStore.members.find(m => m.user_id === auth.user?.id)?.project_id ?? null,
)

const chatOpen = ref(false)

const columns = computed(() => [
  {
    key: 'open',
    title: 'In coda',
    icon: 'i-lucide-clock',
    tickets: openTickets.value,
    emptyTitle: 'Nessun ticket in coda',
    emptyDescription: 'Segnala un bug per aprire il tuo primo ticket.',
  },
  {
    key: 'resolved',
    title: 'Risolto',
    icon: 'i-lucide-check-circle',
    tickets: resolvedTickets.value,
    emptyTitle: 'Nessun ticket risolto',
    emptyDescription: 'I ticket completati dal team compariranno qui.',
  },
])
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-[var(--color-text)]">
          I tuoi ticket
        </h1>
        <p class="text-sm text-[var(--color-text-muted)]">
          Segui lo stato delle tue segnalazioni
        </p>
      </div>
      <UButton
        label="Segnala un bug"
        icon="i-lucide-message-circle-plus"
        size="lg"
        :disabled="!clientProjectId"
        @click="chatOpen = true"
      />
    </div>

    <div
      v-if="loading"
      class="grid gap-4 sm:grid-cols-2"
    >
      <USkeleton
        v-for="i in 4"
        :key="i"
        class="h-28 rounded-[var(--radius-md)]"
      />
    </div>

    <div
      v-else
      class="grid gap-6 sm:grid-cols-2"
    >
      <section
        v-for="column in columns"
        :key="column.key"
        :aria-label="`Colonna ${column.title}`"
      >
        <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
          <UIcon
            :name="column.icon"
            aria-hidden="true"
          />
          {{ column.title }}
          <UBadge
            color="neutral"
            variant="soft"
            size="sm"
          >
            {{ column.tickets.length }}
          </UBadge>
        </h2>

        <div
          v-if="column.tickets.length"
          class="flex flex-col gap-3"
        >
          <BfTicketCard
            v-for="ticket in column.tickets"
            :key="ticket.id"
            :ticket="ticket"
            role="client"
          />
        </div>
        <BfEmptyState
          v-else
          icon="i-lucide-inbox"
          :title="column.emptyTitle"
          :description="column.emptyDescription"
        />
      </section>
    </div>

    <!-- Chatbot di segnalazione: il flusso riparte da zero a ogni apertura -->
    <UModal
      v-model:open="chatOpen"
      title="Segnala un bug"
      description="L'assistente ti guiderà passo passo nella segnalazione."
    >
      <template #body>
        <BfChatBotFlow
          v-if="chatOpen && clientProjectId"
          :project-id="clientProjectId"
          @created="chatOpen = false"
          @cancel="chatOpen = false"
        />
      </template>
    </UModal>
  </div>
</template>
