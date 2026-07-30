<script setup lang="ts">
  /** Layout auth: card centrata su sfondo brand tenue. */
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-brand-50 p-4">
    <div class="w-full max-w-md">
      <div class="mb-6 text-center">
        <div class="flex items-center justify-center gap-2 w-full py-6">
          <div class="flex items-center justify-center size-12 border border-brand-500 rounded-full bg-brand-500">
            <span class="text-4xl text-white font-bold">B</span>
          </div>
          <span class="font-bold text-4xl text-brand-500 tracking-tight">BuggyFilter</span>
        </div>
        <p class="mt-1 text-sm text-[var(--color-text-muted)]">
          Segnalazione e triage intelligente dei bug
        </p>
      </div>
      <div class="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-lg">
        <slot />
      </div>
    </div>
  </main>
</template>
