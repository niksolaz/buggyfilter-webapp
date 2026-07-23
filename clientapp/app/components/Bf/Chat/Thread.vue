<script setup lang="ts">
import type { ChatBubbleItem } from '~~/shared/types/message'

/**
 * BfChatThread — thread di conversazione con auto-scroll e annunci
 * screen-reader (`role=log` + `aria-live=polite`, design doc §2.4).
 */
const props = defineProps<{
  items: ChatBubbleItem[]
  /** Mostra l'indicatore "sta scrivendo…" del bot. */
  typing?: boolean
}>()

const container = ref<HTMLElement | null>(null)

watch(
  () => [props.items.length, props.typing],
  async () => {
    await nextTick()
    container.value?.scrollTo({ top: container.value.scrollHeight, behavior: 'smooth' })
  },
)
</script>

<template>
  <div
    ref="container"
    role="log"
    aria-live="polite"
    aria-label="Conversazione con l'assistente"
    class="flex flex-col gap-3 overflow-y-auto scroll-smooth p-4"
  >
    <BfChatBubble
      v-for="item in items"
      :key="item.id"
      :item="item"
    />
    <!-- Indicatore typing: tre puntini animati -->
    <div
      v-if="typing"
      class="flex justify-start"
      aria-label="L'assistente sta scrivendo"
    >
      <div class="flex items-center gap-1 rounded-[var(--radius-lg)] bg-brand-50 px-4 py-3">
        <span
          v-for="dot in 3"
          :key="dot"
          class="size-1.5 animate-bounce rounded-full bg-brand-500"
          :style="{ animationDelay: `${(dot - 1) * 150}ms` }"
        />
      </div>
    </div>
  </div>
</template>
