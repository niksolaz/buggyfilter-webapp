<script setup lang="ts">
const plans = [
  {
    title: "Basic",
    description:
      "Per iniziare con un singolo progetto e portare ordine nelle prime segnalazioni.",
    price: "9,99",
    icon: "i-lucide-sprout",
    highlighted: false,
    features: [
      "1 workspace",
      "1 repository GitHub",
      "Triage AI essenziale",
      "Ticket con gravità suggerita",
    ],
  },
  {
    title: "Standard",
    description:
      "Per team che gestiscono più prodotti e vogliono accelerare il lavoro quotidiano.",
    price: "49,99",
    icon: "i-lucide-rocket",
    highlighted: true,
    features: [
      "Fino a 5 workspace",
      "Repository GitHub collegati",
      "Scelta del modello AI",
      "Possibili soluzioni incluse",
    ],
  },
  {
    title: "Pro",
    description:
      "Per organizzazioni con processi, volumi e requisiti di assistenza dedicati.",
    price: "99,99",
    icon: "i-lucide-building-2",
    highlighted: false,
    features: [
      "Fino a 10 workspace personalizzati",
      "Repository GitHub collegati",
      "Scelta del modello AI",
      "Possibili soluzioni incluse",
      "Triage AI avanzato",
    ],
  },
];
</script>

<template>
  <section
    class="relative isolate overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 px-5 py-7 shadow-2xl shadow-brand-900/10 backdrop-blur-2xl sm:px-8 sm:py-10"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -right-20 -top-20 -z-10 size-64 rounded-full bg-brand-300/35 blur-3xl"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-24 -left-20 -z-10 size-64 rounded-full bg-amber-200/40 blur-3xl"
    />

    <header class="text-center">
      <UBadge
        color="primary"
        variant="soft"
        size="lg"
        class="rounded-full px-3 py-1 font-medium ring-1 ring-brand-500/10"
      >
        <UIcon name="i-lucide-wallet-cards" class="mr-1 size-3.5" />
        Prezzi semplici e trasparenti
      </UBadge>

      <h1
        class="mt-5 text-balance text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl"
      >
        Un piano per ogni
        <span
          class="bg-gradient-to-r from-brand-600 to-amber-500 bg-clip-text text-transparent"
        >
          fase del team.
        </span>
      </h1>
      <p
        class="mx-auto mt-4 max-w-sm text-pretty text-[15px] leading-7 text-slate-600"
      >
        Confronta le soluzioni disponibili. Potrai scegliere il piano più adatto
        durante la registrazione o direttamente dal tuo account.
      </p>
    </header>

    <div class="mt-8 space-y-4">
      <UCard
        v-for="plan in plans"
        :key="plan.title"
        class="group relative overflow-hidden rounded-3xl border-white/80 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        :class="
          plan.highlighted
            ? 'bg-slate-950 text-white ring-2 ring-brand-400/70 shadow-xl shadow-brand-900/15'
            : 'bg-white/65 ring-1 ring-slate-900/5 shadow-sm hover:bg-white/90'
        "
        :ui="{ body: 'p-5 sm:p-6' }"
      >
        <div
          v-if="plan.highlighted"
          aria-hidden="true"
          class="absolute -right-12 -top-12 size-36 rounded-full bg-brand-500/30 blur-3xl"
        />

        <div class="relative">
          <div class="flex items-start justify-between gap-4">
            <div
              class="flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-105"
              :class="
                plan.highlighted
                  ? 'bg-brand-500 text-white shadow-brand-500/20'
                  : 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-brand-500/20'
              "
            >
              <UIcon :name="plan.icon" class="size-5" />
            </div>
            <UBadge
              v-if="plan.highlighted"
              color="primary"
              variant="solid"
              class="rounded-full"
            >
              Più scelto
            </UBadge>
          </div>

          <div class="mt-5">
            <h2
              class="text-xl font-bold tracking-tight"
              :class="plan.highlighted ? 'text-white' : 'text-slate-950'"
            >
              {{ plan.title }}
            </h2>
            <p
              class="mt-2 text-sm leading-6"
              :class="plan.highlighted ? 'text-slate-300' : 'text-slate-600'"
            >
              {{ plan.description }}
            </p>
          </div>

          <div class="mt-5 flex items-end gap-1.5">
            <span
              v-if="plan.price !== 'Su misura'"
              class="pb-1 text-lg font-semibold"
              :class="plan.highlighted ? 'text-slate-300' : 'text-slate-500'"
              >€</span
            >
            <span
              class="text-4xl font-bold tracking-[-0.05em]"
              :class="plan.highlighted ? 'text-white' : 'text-slate-950'"
            >
              {{ plan.price }}
            </span>
            <span
              v-if="plan.price !== 'Su misura'"
              class="pb-1.5 text-sm"
              :class="plan.highlighted ? 'text-slate-400' : 'text-slate-500'"
              >/ mese</span
            >
          </div>

          <div
            class="my-5 h-px"
            :class="plan.highlighted ? 'bg-white/10' : 'bg-slate-200/80'"
          />

          <ul class="space-y-3">
            <li
              v-for="feature in plan.features"
              :key="feature"
              class="flex items-center gap-3 text-sm"
              :class="plan.highlighted ? 'text-slate-200' : 'text-slate-700'"
            >
              <span
                class="flex size-6 shrink-0 items-center justify-center rounded-full"
                :class="
                  plan.highlighted
                    ? 'bg-brand-500/20 text-brand-300'
                    : 'bg-brand-50 text-brand-600'
                "
              >
                <UIcon name="i-lucide-check" class="size-3.5" />
              </span>
              {{ feature }}
            </li>
          </ul>
        </div>
      </UCard>
    </div>

    <div
      class="mt-7 rounded-2xl border border-white/80 bg-white/60 p-4 text-center shadow-sm ring-1 ring-slate-900/5 backdrop-blur-xl"
    >
      <div
        class="flex items-center justify-center gap-2 text-sm font-semibold text-slate-900"
      >
        <UIcon name="i-lucide-info" class="size-4 text-brand-600" />
        Nessun piano viene attivato da questa pagina
      </div>
      <p class="mt-1.5 text-xs leading-5 text-slate-500">
        La selezione avviene in modo guidato durante la registrazione o,
        successivamente, dall’area riservata.
      </p>
      <UButton
        to="/register"
        size="lg"
        color="primary"
        trailing-icon="i-lucide-arrow-right"
        class="mt-4 justify-center rounded-full px-5 shadow-lg shadow-brand-500/20"
      >
        Registrati e scegli il piano
      </UButton>
    </div>
  </section>
</template>
