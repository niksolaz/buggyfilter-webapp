<script setup lang="ts">
import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'vue-chartjs'

/**
 * Statistiche di progetto: andamento bug nel tempo (1g / 1s / 1m / 1a)
 * e stima di fattura/costo basata su ore stimate × tariffa giornaliera.
 * Tutto deriva reattivamente dagli store: completare un ticket sul Kanban
 * o cambiare la tariffa nei Settings aggiorna questi numeri.
 */
definePageMeta({
  layout: 'operator',
  middleware: 'role',
  roles: ['OPERATOR', 'OWNER'],
})

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const route = useRoute()
const projectId = computed(() => Number(route.params.id))

const projectsStore = useProjectsStore()
const ticketsStore = useTicketsStore()

await Promise.all([projectsStore.fetchAll(), ticketsStore.fetchAll()])

const project = computed(() => projectsStore.projectById(projectId.value))
useHead({ title: () => project.value ? `${project.value.name} · Statistiche` : 'Statistiche' })

const { range, trend, openCount, invoiceEstimate, projectedCost, dailyRate } = useStats(projectId)

const rangeItems = STATS_RANGES.map(r => ({ label: r.label, value: r.key }))

/** Dataset Chart.js: creati (brand) vs risolti (success). */
const chartData = computed(() => ({
  labels: trend.value.labels,
  datasets: [
    {
      label: 'Bug aperti',
      data: trend.value.created,
      borderColor: '#DC2626',
      backgroundColor: 'rgba(220, 38, 38, 0.08)',
      fill: true,
      tension: 0.35,
      pointRadius: 2,
    },
    {
      label: 'Bug risolti',
      data: trend.value.resolved,
      borderColor: '#16A34A',
      backgroundColor: 'rgba(22, 163, 74, 0.08)',
      fill: true,
      tension: 0.35,
      pointRadius: 2,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const } },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
}

const kpis = computed(() => [
  {
    label: 'Ticket aperti',
    value: String(openCount.value),
    icon: 'i-lucide-bug',
    hint: 'In tutti gli stati tranne Complete',
  },
  {
    label: 'Fattura stimata',
    value: formatEur(invoiceEstimate.value),
    icon: 'i-lucide-receipt-euro',
    hint: 'Ticket risolti nel periodo selezionato',
  },
  {
    label: 'Costo proiettato',
    value: formatEur(projectedCost.value),
    icon: 'i-lucide-trending-up',
    hint: 'Stima su tutti i ticket del progetto',
  },
  {
    label: 'Tariffa giornaliera',
    value: formatEur(dailyRate.value),
    icon: 'i-lucide-euro',
    hint: 'Modificabile nelle Impostazioni',
  },
])
</script>

<template>
  <div v-if="project">
    <BfProjectHeader :project-id="projectId" />

    <div class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
      >
        <div class="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <UIcon
            :name="kpi.icon"
            aria-hidden="true"
          />
          {{ kpi.label }}
        </div>
        <p class="mt-1 text-2xl font-bold text-[var(--color-text)]">
          {{ kpi.value }}
        </p>
        <p class="mt-1 text-xs text-[var(--color-text-muted)]">
          {{ kpi.hint }}
        </p>
      </div>
    </div>

    <div class="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="font-semibold text-[var(--color-text)]">
          Andamento bug nel tempo
        </h2>
        <UTabs
          v-model="range"
          :items="rangeItems"
          size="sm"
          :content="false"
        />
      </div>
      <div class="h-72">
        <Line
          :data="chartData"
          :options="chartOptions"
          aria-label="Grafico dell'andamento dei bug aperti e risolti nel tempo"
        />
      </div>
    </div>
  </div>

  <BfEmptyState
    v-else
    icon="i-lucide-folder-x"
    title="Progetto non trovato"
  >
    <UButton
      to="/operator"
      label="Torna alla dashboard"
      variant="outline"
      color="neutral"
      size="sm"
    />
  </BfEmptyState>
</template>
