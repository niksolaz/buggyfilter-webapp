<script setup lang="ts">
  /**
   * Layout operatore: sidebar desktop-first con navigazione ai progetti
   * e menu utente. Densità informativa alta (design doc §0).
   */
  const auth = useAuthStore()
  const projectsStore = useProjectsStore()

  // La sidebar elenca i progetti: assicura il caricamento.
  await projectsStore.fetchAll()

  async function logout() {
    auth.logout()
    await navigateTo('/login')
  }
</script>

<template>
  <div class="flex min-h-screen bg-[var(--color-surface)]">
    <aside class="flex w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)]">
      <div class="border-b border-[var(--color-border)] p-4">
        <NuxtLink to="/operator" class="text-lg font-bold text-[var(--color-text)]">
          <div class="flex items-center gap-2 py-3">
            <div class="flex items-center justify-center size-6 border border-red-600 rounded-full bg-red-600">
              <span class="text-sm text-white font-bold">B</span>
            </div>
            <span class="font-bold text-base text-red-600 tracking-tight">BuggyFilter</span>
          </div>
        </NuxtLink>
        <p class="text-xs text-[var(--color-text-muted)]">
          Operator Dashboard
        </p>
      </div>

      <nav class="flex-1 overflow-y-auto p-3" aria-label="Navigazione principale">
        <NuxtLink to="/operator"
          class="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          active-class="bg-brand-50 text-brand-600">
          <UIcon name="i-lucide-layout-dashboard" aria-hidden="true" />
          Dashboard
        </NuxtLink>

        <p class="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Progetti
        </p>
        <NuxtLink v-for="project in projectsStore.projects" :key="project.id" :to="`/projects/${project.id}`"
          class="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          active-class="bg-brand-50 text-brand-600 font-medium">
          <UIcon name="i-lucide-folder" aria-hidden="true" />
          {{ project.name }}
        </NuxtLink>
      </nav>

      <div class="border-t border-[var(--color-border)] p-3">
        <div class="flex items-center gap-2 px-2">
          <UAvatar :alt="auth.user ? fullName(auth.user) : ''" size="sm" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-[var(--color-text)]">
              {{ auth.user ? fullName(auth.user) : '' }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)]">
              {{ auth.user?.role === 'OWNER' ? 'Owner' : 'Operatore' }}
            </p>
          </div>
          <UButton icon="i-lucide-log-out" color="neutral" variant="ghost" size="sm" aria-label="Esci"
            @click="logout" />
        </div>
      </div>
    </aside>

    <main class="min-w-0 flex-1 p-6">
      <slot />
    </main>
  </div>
</template>
