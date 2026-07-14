<script setup lang="ts">
/**
 * BfProjectHeader — intestazione condivisa dalle pagine di progetto
 * (Board / Statistiche / Impostazioni) con sotto-navigazione a tab.
 */
const props = defineProps<{
  projectId: number
}>()

const projectsStore = useProjectsStore()

const project = computed(() => projectsStore.projectById(props.projectId))

const tabs = computed(() => [
  { label: 'Board', icon: 'i-lucide-kanban', to: `/projects/${props.projectId}` },
  { label: 'Statistiche', icon: 'i-lucide-chart-line', to: `/projects/${props.projectId}/stats` },
  { label: 'Impostazioni', icon: 'i-lucide-settings', to: `/projects/${props.projectId}/settings` },
])
</script>

<template>
  <header class="mb-6">
    <h1 class="text-xl font-bold text-[var(--color-text)]">
      {{ project?.name }}
    </h1>
    <p
      v-if="project?.description"
      class="mt-1 text-sm text-[var(--color-text-muted)]"
    >
      {{ project.description }}
    </p>

    <nav
      class="mt-4 flex gap-1 border-b border-[var(--color-border)]"
      aria-label="Sezioni del progetto"
    >
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="-mb-px inline-flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        exact-active-class="border-[var(--color-brand-600)]! text-[var(--color-brand-600)]!"
      >
        <UIcon
          :name="tab.icon"
          aria-hidden="true"
        />
        {{ tab.label }}
      </NuxtLink>
    </nav>
  </header>
</template>
