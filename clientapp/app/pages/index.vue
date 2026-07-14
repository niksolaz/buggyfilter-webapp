<script setup lang="ts">
/** Root: smista alla home del ruolo (il middleware globale gestisce i non autenticati). */
definePageMeta({ layout: false })

const auth = useAuthStore()
await navigateTo(auth.homePath, { replace: true })
</script>

<template>
  <div />
</template>
