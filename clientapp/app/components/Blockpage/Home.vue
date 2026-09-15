<script setup lang="ts">
const workflow = [
  {
    icon: "i-lucide-layout-grid",
    eyebrow: "01 · Organizza",
    title: "Crea il tuo workspace",
    description:
      "Uno spazio dedicato per ogni prodotto, cliente o team, con contesto e attività sempre separati.",
  },
  {
    icon: "i-lucide-github",
    eyebrow: "02 · Connetti",
    title: "Collega il repository",
    description:
      "Associa ogni workspace al repository GitHub di riferimento, così l’AI può ragionare sul codice reale.",
  },
  {
    icon: "i-lucide-sparkles",
    eyebrow: "03 · Personalizza",
    title: "Scegli il modello AI",
    description:
      "Seleziona il modello più adatto al progetto, alle tecnologie utilizzate e al livello di analisi richiesto.",
  },
  {
    icon: "i-lucide-filter",
    eyebrow: "04 · Analizza",
    title: "Filtra le richieste",
    description:
      "L’AI interpreta le segnalazioni dei clienti, elimina il rumore e trasforma input poco tecnici in informazioni utili.",
  },
  {
    icon: "i-lucide-ticket-check",
    eyebrow: "05 · Risolvi",
    title: "Ricevi ticket già arricchiti",
    description:
      "Il team trova gravità, contesto e una possibile soluzione già pronti. Meno triage, più tempo per risolvere.",
  },
];

const benefits = [
  { icon: "i-lucide-clock-3", label: "Meno tempo perso" },
  { icon: "i-lucide-zap", label: "Bug risolti più velocemente" },
  { icon: "i-lucide-smile", label: "Clienti e team più felici" },
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
      <div class="flex items-center justify-center gap-2 w-full py-6">
        <div
          class="flex items-center justify-center size-14 border border-brand-500 rounded-full bg-brand-500"
        >
          <span class="text-5xl text-white font-bold">B</span>
        </div>
        <div class="font-bold text-5xl text-brand-500 tracking-tight">
          BuggyFilter
        </div>
      </div>
      <UBadge
        color="primary"
        variant="soft"
        size="lg"
        class="rounded-full px-3 py-1 font-medium ring-1 ring-brand-500/10"
      >
        <UIcon name="i-lucide-sparkles" class="mr-1 size-3.5" />
        Dal feedback al fix, con l’AI
      </UBadge>

      <h1
        class="mt-5 text-balance text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl"
      >
        Il bug report entra confuso.
        <span
          class="block bg-gradient-to-r from-brand-600 to-amber-500 bg-clip-text text-transparent"
          >Esce pronto da risolvere.</span
        >
      </h1>
      <p
        class="mx-auto mt-4 max-w-sm text-pretty text-[15px] leading-7 text-slate-600"
      >
        BuggyFilter collega feedback, codice e intelligenza artificiale per
        consegnare al team ticket chiari, prioritizzati e già accompagnati da
        una possibile soluzione.
      </p>

      <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <UButton
          to="/register"
          size="lg"
          color="primary"
          trailing-icon="i-lucide-arrow-right"
          class="justify-center rounded-full px-5 shadow-lg shadow-brand-500/20"
        >
          Crea il tuo workspace
        </UButton>
        <UButton
          to="/login"
          size="lg"
          color="neutral"
          variant="ghost"
          class="justify-center rounded-full px-5"
        >
          Accedi
        </UButton>
      </div>
    </header>

    <div class="my-9 flex items-center gap-3" aria-hidden="true">
      <div class="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
      <UIcon name="i-lucide-chevron-down" class="size-4 text-slate-400" />
      <div class="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
    </div>

    <div>
      <div class="mb-5">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
          Come funziona
        </p>
        <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-950">
          Un flusso semplice, dal setup alla soluzione
        </h2>
      </div>

      <ol class="space-y-3">
        <li
          v-for="item in workflow"
          :key="item.title"
          class="group relative overflow-hidden rounded-2xl border border-white/80 bg-white/65 p-4 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-lg hover:shadow-brand-900/5"
        >
          <div class="flex gap-4">
            <div
              class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20 transition-transform duration-300 group-hover:scale-105"
            >
              <UIcon :name="item.icon" class="size-5" />
            </div>
            <div class="min-w-0">
              <p
                class="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600"
              >
                {{ item.eyebrow }}
              </p>
              <h3 class="mt-1 font-semibold tracking-tight text-slate-900">
                {{ item.title }}
              </h3>
              <p class="mt-1.5 text-sm leading-6 text-slate-600">
                {{ item.description }}
              </p>
            </div>
          </div>
        </li>
      </ol>
    </div>

    <UCard
      class="mt-8 overflow-hidden rounded-3xl bg-slate-950 text-white ring-1 ring-white/10"
      :ui="{ body: 'p-5 sm:p-6' }"
    >
      <div class="relative">
        <div
          aria-hidden="true"
          class="absolute -right-12 -top-14 size-36 rounded-full bg-brand-500/25 blur-3xl"
        />
        <div class="relative">
          <p
            class="text-xs font-bold uppercase tracking-[0.2em] text-brand-300"
          >
            Il risultato
          </p>
          <h2 class="mt-2 text-2xl font-bold tracking-tight">
            Più tempo per costruire.<br />
            Meno tempo per interpretare.
          </h2>
          <ul class="mt-5 grid gap-2.5">
            <li
              v-for="benefit in benefits"
              :key="benefit.label"
              class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-3 backdrop-blur"
            >
              <span
                class="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-300"
              >
                <UIcon :name="benefit.icon" class="size-4" />
              </span>
              <span class="text-sm font-medium text-slate-100">{{
                benefit.label
              }}</span>
            </li>
          </ul>
        </div>
      </div>
    </UCard>
  </section>
</template>
