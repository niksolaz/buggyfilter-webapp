<script setup lang="ts">
/** Pagina pubblica iniziale: nessun redirect automatico al login. */
definePageMeta({ layout: "default" });

const name = inject("currentView") as Ref<string>;
</script>

<template>
  <div>
    <BlockpageHome v-if="name === 'home'" />
    <BlockpagePricing v-else />
  </div>
</template>
