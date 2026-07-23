<script setup lang="ts">
  /**
   * Layout cliente: topbar minimale, densità bassa e rassicurante,
   * mobile-aware (design doc §0).
   */
  const auth = useAuthStore()

  async function logout() {
    auth.logout()
    await navigateTo('/login')
  }
</script>

<template>
  <div class="min-h-screen bg-[var(--color-surface)]">
    <header class="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <NuxtLink to="/client" class="text-lg font-bold text-[var(--color-text)]">
          <div class="flex items-center gap-2 py-3">
            <div class="flex items-center justify-center size-6 border border-red-600 rounded-full bg-red-600">
              <span class="text-sm text-white font-bold">B</span>
            </div>
            <span class="font-bold text-base text-red-600 tracking-tight">BuggyFilter</span>
          </div>
        </NuxtLink>
        <div class="flex items-center gap-3">
          <span class="hidden text-sm text-[var(--color-text-muted)] sm:inline">
            {{ auth.user ? fullName(auth.user) : '' }}
          </span>
          <UAvatar :alt="auth.user ? fullName(auth.user) : ''" size="sm" />
          <UButton icon="i-lucide-log-out" color="neutral" variant="ghost" size="sm" aria-label="Esci"
            @click="logout" />
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-4xl p-4">
      <slot />
    </main>
  </div>
</template>
