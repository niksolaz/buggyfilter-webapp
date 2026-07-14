<script setup lang="ts">
/**
 * Board di progetto stile Trello: colonne ToDo / In Progress / Review /
 * Complete. Il drop su Complete aggiorna le stime in Statistiche
 * (reattività degli store, nessun wiring manuale).
 */
definePageMeta({
  layout: 'operator',
  middleware: 'role',
  roles: ['OPERATOR', 'OWNER'],
})

const route = useRoute()
const projectId = computed(() => Number(route.params.id))

const projectsStore = useProjectsStore()
const ticketsStore = useTicketsStore()

await Promise.all([projectsStore.fetchAll(), ticketsStore.fetchAll()])

const project = computed(() => projectsStore.projectById(projectId.value))

useHead({ title: () => project.value ? `${project.value.name} · Board` : 'Board' })
</script>

<template>
  <div v-if="project">
    <BfProjectHeader :project-id="projectId" />
    <BfKanbanBoard :project-id="projectId" />
  </div>
  <BfEmptyState
    v-else
    icon="i-lucide-folder-x"
    title="Progetto non trovato"
    description="Il progetto richiesto non esiste o non ne fai parte."
  >
    <UButton
      to="/operator"
      label="Torna alla dashboard"
      variant="outline"
      color="neutral"
      size="sm"
    />
  </BfEmptyState>
</template>
