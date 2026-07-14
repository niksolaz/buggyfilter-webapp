<script setup lang="ts">
/** BfEmptyState — stato vuoto illustrato per liste e colonne. */
withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
}>(), {
  icon: 'i-lucide-inbox',
  description: '',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-6 text-center">
    <UIcon
      :name="icon"
      class="size-8 text-[var(--color-text-muted)]"
      aria-hidden="true"
    />
    <p class="text-sm font-medium text-[var(--color-text)]">
      {{ title }}
    </p>
    <p
      v-if="description"
      class="text-xs text-[var(--color-text-muted)]"
    >
      {{ description }}
    </p>
    <slot />
  </div>
</template>
