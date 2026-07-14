<script setup lang="ts">
import type { Severity } from '~~/shared/types/ticket'

/**
 * BfSeverityBadge — SOLO superfici operator/admin (design doc §1.2):
 * non deve mai comparire nel Client Portal. Icona + testo, mai solo colore.
 */
const props = defineProps<{
  severity: Severity
}>()

const meta = computed(() => SEVERITY_META[props.severity])
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white"
    :style="{ backgroundColor: meta.cssVar }"
    :aria-label="`Severità: ${meta.label}`"
  >
    <UIcon
      :name="meta.icon"
      class="size-3"
      aria-hidden="true"
    />
    {{ meta.label }}
  </span>
</template>
