<script setup lang="ts">
/**
 * Login MOCK: verifica le credenziali contro gli utenti seedati
 * (password `demo` per tutti). I bottoni "Accesso rapido" servono
 * per le demo senza digitare nulla.
 */
definePageMeta({ layout: 'auth' })
useHead({ title: 'Accedi' })

const auth = useAuthStore()

const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(form.email, form.password)
    await navigateTo(auth.homePath, { replace: true })
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Errore imprevisto'
  }
  finally {
    loading.value = false
  }
}

/** Accesso demo con un click. */
async function quickLogin(email: string) {
  form.email = email
  form.password = 'demo'
  await submit()
}
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-[var(--color-text)]">
      Accedi
    </h2>
    <p class="mb-4 text-sm text-[var(--color-text-muted)]">
      Utenti demo: password <code class="rounded bg-[var(--color-surface)] px-1 font-mono">demo</code>
    </p>

    <form
      class="flex flex-col gap-4"
      @submit.prevent="submit"
    >
      <UFormField
        label="Email"
        name="email"
        required
      >
        <UInput
          v-model="form.email"
          type="email"
          placeholder="nome@azienda.com"
          icon="i-lucide-mail"
          autocomplete="email"
          required
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Password"
        name="password"
        required
      >
        <UInput
          v-model="form.password"
          type="password"
          placeholder="••••••••"
          icon="i-lucide-lock"
          autocomplete="current-password"
          required
          class="w-full"
        />
      </UFormField>

      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-alert-circle"
        :title="error"
      />

      <UButton
        type="submit"
        label="Accedi"
        block
        :loading="loading"
      />
    </form>

    <USeparator
      label="oppure accesso rapido"
      class="my-4"
    />

    <div class="flex gap-2">
      <UButton
        label="Operatore"
        icon="i-lucide-wrench"
        variant="outline"
        color="neutral"
        block
        :disabled="loading"
        @click="quickLogin('operator@buggyfilter.dev')"
      />
      <UButton
        label="Cliente"
        icon="i-lucide-building-2"
        variant="outline"
        color="neutral"
        block
        :disabled="loading"
        @click="quickLogin('client@acme.com')"
      />
    </div>

    <p class="mt-4 text-center text-sm text-[var(--color-text-muted)]">
      Non hai un account?
      <NuxtLink
        to="/register"
        class="font-medium text-[var(--color-brand-600)] hover:underline"
      >
        Registrati
      </NuxtLink>
    </p>
  </div>
</template>
