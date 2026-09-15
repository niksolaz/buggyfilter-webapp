<script setup lang="ts">
/**
 * Registrazione MOCK: valida i campi essenziali lato client e simula
 * la creazione dell'account (nessuna persistenza).
 */
import { authService } from '~/services'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Registrati' })

const toast = useToast()

type PlanId = 'basic' | 'standard' | 'pro'

const plans: Array<{
  id: PlanId
  name: string
  price: string
  description: string
  icon: string
  recommended?: boolean
}> = [
  {
    id: 'basic',
    name: 'Basic',
    price: '9,99 €',
    description: 'Per iniziare con un workspace',
    icon: 'i-lucide-sprout',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '49,99 €',
    description: 'Per team fino a 5 workspace',
    icon: 'i-lucide-rocket',
    recommended: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '99,99 €',
    description: 'Per realtà fino a 10 workspace',
    icon: 'i-lucide-building-2',
  },
]

const form = reactive({
  email: '',
  password: '',
  phone: '',
  location: '',
  plan: 'standard' as PlanId,
})
const errors = reactive<Record<string, string>>({})
const serverError = ref('')
const loading = ref(false)

function validate(): boolean {
  errors.email = /^\S+@\S+\.\S+$/.test(form.email)
    ? ''
    : 'Inserisci una email valida'
  errors.password = form.password.length >= 8 ? '' : 'Minimo 8 caratteri'
  errors.phone = /^[+\d][\d\s-]{5,}$/.test(form.phone)
    ? ''
    : 'Inserisci un numero di telefono valido'
  errors.location
    = form.location.trim().length >= 2 ? '' : 'Inserisci la tua città'
  errors.plan = plans.some(plan => plan.id === form.plan)
    ? ''
    : 'Scegli un piano'
  return !errors.email && !errors.password && !errors.phone && !errors.location && !errors.plan
}

async function submit() {
  serverError.value = ''
  if (!validate()) return
  loading.value = true
  try {
    await authService.register({ ...form })
    toast.add({
      title: 'Registrazione completata!',
      description: `Piano ${plans.find(plan => plan.id === form.plan)?.name} selezionato. Ora puoi accedere con le tue credenziali.`,
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
      <fieldset>
        <legend class="mb-2 text-sm font-medium text-[var(--color-text)]">
          Scegli il piano
          <span
            class="text-red-500"
            aria-hidden="true"
          >*</span>
        </legend>
        <div class="grid gap-2.5">
          <label
            v-for="plan in plans"
            :key="plan.id"
            class="group relative cursor-pointer overflow-hidden rounded-2xl border p-3.5 backdrop-blur-xl transition duration-200"
            :class="form.plan === plan.id
              ? 'border-brand-400 bg-brand-50/80 shadow-md shadow-brand-900/5 ring-1 ring-brand-400/30'
              : 'border-white/80 bg-white/55 ring-1 ring-slate-900/5 hover:border-brand-200 hover:bg-white/80'"
          >
            <input
              v-model="form.plan"
              type="radio"
              name="plan"
              :value="plan.id"
              class="sr-only"
            >
            <span class="flex items-center gap-3">
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-xl transition"
                :class="form.plan === plan.id ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' : 'bg-slate-100 text-slate-500'"
              >
                <UIcon
                  :name="plan.icon"
                  class="size-4.5"
                />
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-2">
                  <span class="font-semibold text-slate-950">{{ plan.name }}</span>
                  <UBadge
                    v-if="plan.recommended"
                    color="primary"
                    variant="soft"
                    size="sm"
                    class="rounded-full"
                  >
                    Consigliato
                  </UBadge>
                </span>
                <span class="mt-0.5 block text-xs text-slate-500">{{ plan.description }}</span>
              </span>
              <span class="text-right">
                <span class="block text-sm font-bold text-slate-950">{{ plan.price }}</span>
                <span class="block text-[10px] text-slate-500">al mese</span>
              </span>
              <UIcon
                v-if="form.plan === plan.id"
                name="i-lucide-circle-check"
                class="absolute right-2 top-2 size-4 text-brand-600"
              />
            </span>
          </label>
        </div>
        <p
          v-if="errors.plan"
          class="mt-1.5 text-xs text-red-500"
        >
          {{ errors.plan }}
        </p>
        <p
          v-else
          class="mt-2 flex items-center gap-1.5 text-xs text-slate-500"
        >
          <UIcon
            name="i-lucide-info"
            class="size-3.5 text-brand-600"
          />
          Dati dimostrativi: nessun addebito verrà effettuato.
        </p>
      </fieldset>

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
