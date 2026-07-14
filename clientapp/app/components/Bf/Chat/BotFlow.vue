<script setup lang="ts">
import type { ChatBubbleItem } from '~~/shared/types/message'
import type { Severity, TicketAttachment } from '~~/shared/types/ticket'

/**
 * BfChatBotFlow — chatbot FINTO di creazione ticket (macchina a step
 * scriptata, nessuna AI reale). Raccoglie: titolo → descrizione →
 * fino a 3 immagini → priorità → conferma. Alla conferma crea il ticket
 * in "In coda"; da quel momento il cliente non può più modificarlo.
 */
const props = defineProps<{
  projectId: number
}>()

const emit = defineEmits<{
  /** `created`: ticket creato con successo (il parent chiude la modale). */
  created: []
  cancel: []
}>()

const auth = useAuthStore()
const { create } = useClientTickets()
const toast = useToast()

type Step = 'title' | 'description' | 'images' | 'priority' | 'confirm' | 'done'

const step = ref<Step>('title')
const typing = ref(false)
const bubbles = ref<ChatBubbleItem[]>([])
const draft = reactive({
  title: '',
  description: '',
  attachments: [] as TicketAttachment[],
  priority: null as Severity | null,
})
const textInput = ref('')
const submitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const MAX_IMAGES = 3

function pushBubble(item: Omit<ChatBubbleItem, 'id'>) {
  bubbles.value.push({ id: crypto.randomUUID(), ...item })
}

/** Il bot "scrive" per ~700ms prima di rispondere (effetto typing). */
function botSay(content: string, nextStep?: Step) {
  typing.value = true
  setTimeout(() => {
    typing.value = false
    pushBubble({ sender: 'bot', content })
    if (nextStep) step.value = nextStep
  }, 700)
}

onMounted(() => {
  const name = auth.user?.first_name ?? ''
  botSay(`Ciao ${name}! 👋 Sono l'assistente di BuggyFilter. Come si intitola il problema che vuoi segnalare?`)
})

/** Step titolo/descrizione: il cliente scrive nel campo di testo. */
function sendText() {
  const text = textInput.value.trim()
  if (!text) return
  pushBubble({ sender: 'client', content: text })
  textInput.value = ''

  if (step.value === 'title') {
    draft.title = text
    botSay('Perfetto. Ora descrivimi il problema con tutti i dettagli che puoi: cosa succede, dove e quando?', 'description')
  }
  else if (step.value === 'description') {
    draft.description = text
    botSay(`Vuoi allegare degli screenshot? Puoi caricare fino a ${MAX_IMAGES} immagini, oppure saltare questo passaggio.`, 'images')
  }
}

/** Step immagini: max 3, con anteprima via Object URL (mock upload). */
function onFilesSelected(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files ?? [])
  const remaining = MAX_IMAGES - draft.attachments.length
  for (const file of files.slice(0, remaining)) {
    draft.attachments.push({
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
    })
  }
  if (fileInput.value) fileInput.value.value = ''
}

function removeAttachment(id: string) {
  draft.attachments = draft.attachments.filter(a => a.id !== id)
}

function confirmImages() {
  if (draft.attachments.length) {
    pushBubble({
      sender: 'client',
      content: `Ecco ${draft.attachments.length === 1 ? 'lo screenshot' : `i miei ${draft.attachments.length} screenshot`}.`,
      images: draft.attachments.map(a => a.url),
    })
  }
  else {
    pushBubble({ sender: 'client', content: 'Nessuna immagine, procediamo.' })
  }
  botSay('Ricevuto! Ultima cosa: che priorità daresti a questo problema?', 'priority')
}

/** Step priorità: chips con i colori della scala severità. */
function pickPriority(priority: Severity) {
  draft.priority = priority
  pushBubble({ sender: 'client', content: `Priorità ${SEVERITY_META[priority].label}.` })
  botSay(
    `Riepilogo: "${draft.title}" — ${draft.description.slice(0, 80)}${draft.description.length > 80 ? '…' : ''} · `
    + `${draft.attachments.length} allegati · priorità ${SEVERITY_META[priority].label}. Confermi l'invio?`,
    'confirm',
  )
}

/** Conferma finale: crea il ticket (immutabile per il cliente da qui in poi). */
async function confirmTicket() {
  if (!draft.priority) return
  submitting.value = true
  try {
    await create({
      project_id: props.projectId,
      title: draft.title,
      description: draft.description,
      priority: draft.priority,
      attachments: draft.attachments,
    })
    step.value = 'done'
    botSay('Fatto! 🎉 Il tuo ticket è in coda: il team lo prenderà in carico al più presto. Riceverai aggiornamenti qui.')
  }
  catch {
    toast.add({ title: 'Invio non riuscito', description: 'Riprova tra qualche istante.', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

const priorityOptions = Object.entries(SEVERITY_META) as [Severity, typeof SEVERITY_META[Severity]][]
</script>

<template>
  <div class="flex h-[32rem] flex-col">
    <BfChatThread
      :items="bubbles"
      :typing="typing"
      class="flex-1"
    />

    <!-- Area input: cambia in base allo step corrente -->
    <div class="border-t border-[var(--color-border)] p-3">
      <!-- Titolo / descrizione: testo libero -->
      <form
        v-if="step === 'title' || step === 'description'"
        class="flex items-end gap-2"
        @submit.prevent="sendText"
      >
        <UTextarea
          v-model="textInput"
          :rows="step === 'description' ? 3 : 1"
          autoresize
          class="flex-1"
          :placeholder="step === 'title' ? 'Es. Login non funziona su mobile' : 'Descrivi il problema…'"
          :aria-label="step === 'title' ? 'Titolo del problema' : 'Descrizione del problema'"
          @keydown.enter.exact.prevent="sendText"
        />
        <UButton
          type="submit"
          icon="i-lucide-send"
          :disabled="!textInput.trim() || typing"
          aria-label="Invia"
        />
      </form>

      <!-- Immagini: upload con anteprime, max 3 -->
      <div
        v-else-if="step === 'images'"
        class="flex flex-col gap-2"
      >
        <div
          v-if="draft.attachments.length"
          class="flex gap-2"
        >
          <div
            v-for="attachment in draft.attachments"
            :key="attachment.id"
            class="relative"
          >
            <img
              :src="attachment.url"
              :alt="attachment.name"
              class="size-16 rounded-[var(--radius-sm)] border border-[var(--color-border)] object-cover"
            >
            <UButton
              icon="i-lucide-x"
              size="xs"
              color="error"
              variant="solid"
              class="absolute -right-2 -top-2 rounded-full"
              :aria-label="`Rimuovi ${attachment.name}`"
              @click="removeAttachment(attachment.id)"
            />
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="onFilesSelected"
        >
        <div class="flex gap-2">
          <UButton
            icon="i-lucide-image-plus"
            variant="outline"
            color="neutral"
            :disabled="draft.attachments.length >= MAX_IMAGES"
            :label="`Carica immagini (${draft.attachments.length}/${MAX_IMAGES})`"
            @click="fileInput?.click()"
          />
          <UButton
            :label="draft.attachments.length ? 'Continua' : 'Salta'"
            trailing-icon="i-lucide-arrow-right"
            :disabled="typing"
            @click="confirmImages"
          />
        </div>
      </div>

      <!-- Priorità: chips coi colori severità -->
      <div
        v-else-if="step === 'priority'"
        class="flex flex-wrap gap-2"
        role="group"
        aria-label="Scegli la priorità"
      >
        <button
          v-for="[key, meta] in priorityOptions"
          :key="key"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-600)]"
          :style="{ backgroundColor: meta.cssVar }"
          :disabled="typing"
          @click="pickPriority(key)"
        >
          <UIcon
            :name="meta.icon"
            aria-hidden="true"
          />
          {{ meta.label }}
        </button>
      </div>

      <!-- Conferma finale -->
      <div
        v-else-if="step === 'confirm'"
        class="flex gap-2"
      >
        <UButton
          label="Conferma e invia"
          icon="i-lucide-check"
          :loading="submitting"
          :disabled="typing"
          @click="confirmTicket"
        />
        <UButton
          label="Annulla"
          variant="ghost"
          color="neutral"
          :disabled="submitting"
          @click="emit('cancel')"
        />
      </div>

      <!-- Fine flusso -->
      <div
        v-else-if="step === 'done'"
        class="flex justify-end"
      >
        <UButton
          label="Chiudi"
          icon="i-lucide-check"
          :disabled="typing"
          @click="emit('created')"
        />
      </div>
    </div>
  </div>
</template>
