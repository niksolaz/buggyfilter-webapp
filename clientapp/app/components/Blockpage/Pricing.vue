<script setup lang="ts">
/** Pagina pubblica iniziale: nessun redirect automatico al login. */
const plans = [
  {
    title: "Basic",
    description: "Piano gratuito con funzionalità limitate per 1 cliente",
    price: 9.99,
  },
  {
    title: "Standard",
    description: "Piano professionale con funzionalità avanzate e 5 clienti",
    price: 49.99,
  },
  {
    title: "Enterprise",
    description: "Piano aziendale con supporto dedicato",
    price: "***",
  },
];
</script>

<template>
  <div class="flex justify-center items-center gap-4">
    <div
      v-for="plan in plans"
      class="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 content-around shadow-lg block-64 inline-48 space-y-5"
    >
      <h2 class="text-lg font-semibold text-[var(--color-text)]">
        {{ plan.title }}
      </h2>
      <p class="text-sm text-[var(--color-text-muted)]">
        {{}} {{ plan.description }}
      </p>
      <p
        class="text-2xl font-bold text-[var(--color-text)] flex items-center gap-1"
      >
        <span>{{ plan.price }}</span>
        <span class="text-sm font-normal min-inline-24"> €/ mese</span>
      </p>
    </div>
  </div>
</template>
