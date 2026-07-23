<script setup lang="ts">
import type { ChatBubbleItem } from '~~/shared/types/message'

/**
 * BfChatBubble — bolla di chat con tre mittenti distinti (design doc §2.4):
 * cliente a destra (brand-600), bot/AI a sinistra (brand-50), operatore a
 * sinistra (surface).
 */
const props = defineProps<{
  item: ChatBubbleItem
}>()

const isClient = computed(() => props.item.sender === 'client')

const senderLabel = computed(() => ({
  client: 'Tu',
  bot: 'Assistente',
  operator: 'Operatore',
}[props.item.sender]))
</script>

<template>
  <div
    class="flex"
    :class="isClient ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[80%] rounded-[var(--radius-lg)] px-4 py-2.5 text-sm leading-relaxed"
      :class="{
        'bg-brand-600 text-white': item.sender === 'client',
        'bg-brand-50 text-[var(--color-text)]': item.sender === 'bot',
        'bg-[var(--color-surface)] text-[var(--color-text)]': item.sender === 'operator',
      }"
    >
      <span class="sr-only">{{ senderLabel }}:</span>
      <span
        v-if="item.sender === 'bot'"
        class="mr-1"
        aria-hidden="true"
      >🤖</span>
      <span
        v-else-if="item.sender === 'operator'"
        class="mr-1"
        aria-hidden="true"
      >👤</span>
      {{ item.content }}
      <div
        v-if="item.images?.length"
        class="mt-2 flex gap-2"
      >
        <img
          v-for="(src, index) in item.images"
          :key="index"
          :src="src"
          :alt="`Allegato ${index + 1}`"
          class="size-16 rounded-[var(--radius-sm)] object-cover"
        >
      </div>
    </div>
  </div>
</template>
