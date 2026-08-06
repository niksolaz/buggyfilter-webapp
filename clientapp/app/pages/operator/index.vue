<script setup lang="ts">
/**
 * Dashboard Operatore: tutti i progetti con i rispettivi clienti
 * e i conteggi dei ticket per stato.
 */
definePageMeta({
  layout: 'operator',
  middleware: 'role',
  roles: ['OPERATOR', 'OWNER'],
})
useHead({ title: 'Dashboard' })

const projectsStore = useProjectsStore()
const ticketsStore = useTicketsStore()

await Promise.all([projectsStore.fetchAll(), ticketsStore.fetchAll()])

/** Modale di creazione: il form si rimonta a ogni apertura (campi puliti). */
const createOpen = ref(false)

function onCreated(projectId: number) {
  createOpen.value = false
  navigateTo(`/projects/${projectId}`)
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-[var(--color-text)]">
        I tuoi progetti
      </h1>
      <UButton
        label="Nuovo progetto"
        icon="i-lucide-plus"
        @click="createOpen = true"
      />
    </div>

    <BfEmptyState
      v-if="!projectsStore.projects.length"
      icon="i-lucide-folder-open"
      title="Nessun progetto"
      description="Crea il primo progetto per iniziare a raccogliere le segnalazioni dei clienti."
    >
      <UButton
        label="Nuovo progetto"
        icon="i-lucide-plus"
        size="sm"
        @click="createOpen = true"
      />
    </BfEmptyState>

    <div
      v-else
      class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <NuxtLink
        v-for="project in projectsStore.projects"
        :key="project.id"
        :to="`/projects/${project.id}`"
        class="group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md"
      >
        <h2 class="font-semibold text-[var(--color-text)] group-hover:text-brand-600">
          {{ project.name }}
        </h2>
        <p class="mt-1 line-clamp-2 text-sm text-[var(--color-text-muted)]">
          {{ project.description }}
        </p>

        <!-- Conteggi ticket per stato -->
        <div class="mt-4 flex flex-wrap gap-2">
          <UBadge
            v-for="column in KANBAN_COLUMNS"
            :key="column.status"
            :color="STATUS_COLORS[column.status]"
            variant="subtle"
            size="sm"
          >
            {{ column.label }}: {{ ticketsStore.countsByStatus(project.id)[column.status] }}
          </UBadge>
        </div>

        <!-- Clienti del progetto -->
        <div class="mt-4 border-t border-[var(--color-border)] pt-3">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Clienti
          </p>
          <div
            v-for="member in projectsStore.clientsOf(project.id)"
            :key="member.id"
            class="flex items-center gap-2 py-1"
          >
            <UAvatar
              :alt="fullName(member.user)"
              size="2xs"
            />
            <span class="text-sm text-[var(--color-text)]">{{ fullName(member.user) }}</span>
            <span class="text-xs text-[var(--color-text-muted)]">{{ member.user.email }}</span>
          </div>
          <p
            v-if="!projectsStore.clientsOf(project.id).length"
            class="text-xs text-[var(--color-text-muted)]"
          >
            Nessun cliente invitato
          </p>
        </div>
      </NuxtLink>
    </div>

    <!-- Creazione progetto: chi lo crea ne diventa ADMIN -->
    <UModal
      v-model:open="createOpen"
      title="Nuovo progetto"
      description="Imposta le informazioni di base. Potrai invitare clienti e operatori dalle impostazioni."
    >
      <template #body>
        <BfProjectForm
          v-if="createOpen"
          @created="onCreated"
          @cancel="createOpen = false"
        />
      </template>
    </UModal>
  </div>
</template>
