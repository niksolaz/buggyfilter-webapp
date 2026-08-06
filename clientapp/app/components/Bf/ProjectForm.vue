<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type { NewProjectInput } from '~~/shared/types/project'

/**
 * BfProjectForm — form di creazione progetto usato nella modale della
 * dashboard operatore. Chi crea il progetto ne diventa ADMIN (lo fa il
 * service), quindi qui si raccolgono solo le informazioni di base.
 */
const emit = defineEmits<{
  /** `created`: progetto creato (il parent chiude la modale). */
  created: [projectId: number]
  cancel: []
}>()

const auth = useAuthStore()
const projectsStore = useProjectsStore()
const toast = useToast()

const state = reactive<NewProjectInput>({
  name: '',
  description: '',
  daily_rate: DEFAULT_DAILY_RATE,
})

const submitting = ref(false)

function validate(data: NewProjectInput): FormError[] {
  const errors: FormError[] = []
  if (!data.name.trim()) {
    errors.push({ name: 'name', message: 'Il nome è obbligatorio' })
  }
  if (!data.description.trim()) {
    errors.push({ name: 'description', message: 'Aggiungi una breve descrizione' })
  }
  if (data.daily_rate <= 0) {
    errors.push({ name: 'daily_rate', message: 'La tariffa deve essere maggiore di zero' })
  }
  return errors
}

async function onSubmit(event: FormSubmitEvent<NewProjectInput>) {
  if (!auth.user) return
  submitting.value = true
  try {
    const project = await projectsStore.createProject(event.data, auth.user.id)
    toast.add({
      title: 'Progetto creato',
      description: `"${project.name}" è pronto: sei il suo ADMIN.`,
      color: 'success',
      icon: 'i-lucide-folder-plus',
    })
    emit('created', project.id)
  }
  catch (e) {
    // Es. nome duplicato: l'errore resta nella modale, i dati non si perdono.
    toast.add({
      title: e instanceof Error ? e.message : 'Impossibile creare il progetto',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <UForm
    :state="state"
    :validate="validate"
    class="flex flex-col gap-4"
    @submit="onSubmit"
  >
    <UFormField
      label="Nome del progetto"
      name="name"
      required
    >
      <UInput
        v-model="state.name"
        placeholder="es. webapp-acme"
        icon="i-lucide-folder"
        autofocus
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="Descrizione"
      name="description"
      required
      description="Una riga che aiuti il team a riconoscere il progetto."
    >
      <UTextarea
        v-model="state.description"
        :rows="3"
        placeholder="es. Portale web ACME: area riservata clienti e checkout."
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="Tariffa giornaliera"
      name="daily_rate"
      description="Usata per stimare costi e fattura in Statistiche. Modificabile in seguito."
    >
      <UInputNumber
        v-model="state.daily_rate"
        :min="0"
        :step="10"
        :format-options="{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }"
        class="w-40"
      />
    </UFormField>

    <div class="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
      <UButton
        label="Annulla"
        color="neutral"
        variant="ghost"
        :disabled="submitting"
        @click="emit('cancel')"
      />
      <UButton
        type="submit"
        label="Salva"
        icon="i-lucide-check"
        :loading="submitting"
      />
    </div>
  </UForm>
</template>
