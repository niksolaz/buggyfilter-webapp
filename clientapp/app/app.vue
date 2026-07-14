<script setup lang="ts">
/**
 * Shell dell'applicazione: UApp fornisce toast, tooltip e overlay di Nuxt UI.
 * Il layout attivo è deciso da ogni pagina via definePageMeta({ layout }).
 */
useHead({
  titleTemplate: (title?: string) => (title ? `${title} · BuggyFilter` : 'BuggyFilter'),
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
