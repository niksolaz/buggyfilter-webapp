<script setup lang="ts">
/**
 * Registrazione MOCK: valida i campi essenziali lato client e simula
 * la creazione dell'account (nessuna persistenza).
 */
import { authService } from '~/services'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Registrati' })

const toast = useToast()

const form = reactive({
  email: '',
  password: '',
  phone: '',
  location: '',
})
const errors = reactive<Record<string, string>>({})
const serverError = ref('')
const loading = ref(false)

function validate(): boolean {
  errors.email = /^\S+@\S+\.\S+$/.test(form.email) ? '' : 'Inserisci una email valida'
  errors.password = form.password.length >= 8 ? '' : 'Minimo 8 caratteri'
  errors.phone = /^[+\d][\d\s-]{5,}$/.test(form.phone) ? '' : 'Inserisci un numero di telefono valido'
  errors.location = form.location.trim().length >= 2 ? '' : 'Inserisci la tua città'
  return !errors.email && !errors.password && !errors.phone && !errors.location
}

async function submit() {
  serverError.value = ''
  if (!validate()) return
  loading.value = true
  try {
    await authService.register({ ...form })
    toast.add({
      title: 'Registrazione completata!',
      description: 'Ora puoi accedere con le tue credenziali.',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
    await navigateTo('/login')
  }
  catch (e) {
    serverError.value = e instanceof Error ? e.message : 'Errore imprevisto'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="mb-4 text-lg font-semibold text-[var(--color-text)]">
      Crea il tuo account
    </h2>

    <form
      class="flex flex-col gap-4"
      novalidate
      @submit.prevent="submit"
    >
      <UFormField
        label="Email"
        name="email"
        required
        :error="errors.email || undefined"
      >
        <UInput
          v-model="form.email"
          type="email"
          placeholder="nome@azienda.com"
          icon="i-lucide-mail"
          autocomplete="email"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Password"
        name="password"
        required
        :error="errors.password || undefined"
      >
        <UInput
          v-model="form.password"
          type="password"
          placeholder="Minimo 8 caratteri"
          icon="i-lucide-lock"
          autocomplete="new-password"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Telefono"
        name="phone"
        required
        :error="errors.phone || undefined"
      >
        <UInput
          v-model="form.phone"
          type="tel"
          placeholder="+39 333 1234567"
          icon="i-lucide-phone"
          autocomplete="tel"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Località"
        name="location"
        required
        :error="errors.location || undefined"
      >
        <UInput
          v-model="form.location"
          placeholder="Es. Milano, Italia"
          icon="i-lucide-map-pin"
          autocomplete="address-level2"
          class="w-full"
        />
      </UFormField>

      <UAlert
        v-if="serverError"
        color="error"
        variant="subtle"
        icon="i-lucide-alert-circle"
        :title="serverError"
      />

      <UButton
        type="submit"
        label="Registrati"
        block
        :loading="loading"
      />
    </form>

    <p class="mt-4 text-center text-sm text-[var(--color-text-muted)]">
      Hai già un account?
      <NuxtLink
        to="/login"
        class="font-medium text-brand-600 hover:underline"
      >
        Accedi
      </NuxtLink>
    </p>
  </div>
</template>
