<script setup lang="ts">
/** Layout auth: card centrata su sfondo brand tenue. */
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-[var(--color-brand-50)] p-4">
    <div class="w-full max-w-md">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold text-[var(--color-text)]">
          🐞 BuggyFilter
        </h1>
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
