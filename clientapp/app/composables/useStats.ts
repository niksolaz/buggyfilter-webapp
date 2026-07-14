import type { OperatorTicket } from '~~/shared/types/ticket'

export type StatsRange = 'day' | 'week' | 'month' | 'year'

export const STATS_RANGES: { key: StatsRange, label: string }[] = [
  { key: 'day', label: '1 giorno' },
  { key: 'week', label: '1 settimana' },
  { key: 'month', label: '1 mese' },
  { key: 'year', label: '1 anno' },
]

interface RangeConfig {
  buckets: number
  bucketMs: number
  label: (start: Date) => string
}

const HOUR = 3600_000
const DAY = 24 * HOUR

const RANGE_CONFIGS: Record<StatsRange, RangeConfig> = {
  day: { buckets: 24, bucketMs: HOUR, label: d => `${d.getHours()}:00` },
  week: { buckets: 7, bucketMs: DAY, label: d => d.toLocaleDateString('it-IT', { weekday: 'short' }) },
  month: { buckets: 30, bucketMs: DAY, label: d => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) },
  year: { buckets: 12, bucketMs: 30 * DAY, label: d => d.toLocaleDateString('it-IT', { month: 'short' }) },
}

/**
 * Statistiche di progetto derivate reattivamente dagli store:
 * quando un ticket passa a Done sul Kanban o cambia la dailyRate nei
 * Settings, trend e stime si aggiornano da sole.
 */
export function useStats(projectId: Ref<number>) {
  const ticketsStore = useTicketsStore()
  const projectsStore = useProjectsStore()

  const range = ref<StatsRange>('month')

  const projectTickets = computed<OperatorTicket[]>(() =>
    ticketsStore.byProject(projectId.value),
  )

  const dailyRate = computed(() => projectsStore.dailyRateOf(projectId.value))

  /** Serie temporali creati/risolti nel range selezionato. */
  const trend = computed(() => {
    const config = RANGE_CONFIGS[range.value]
    const now = Date.now()
    const start = now - config.buckets * config.bucketMs

    const labels: string[] = []
    const created = new Array<number>(config.buckets).fill(0)
    const resolved = new Array<number>(config.buckets).fill(0)

    for (let i = 0; i < config.buckets; i++) {
      labels.push(config.label(new Date(start + i * config.bucketMs)))
    }

    const bucketOf = (iso: string) => Math.floor((new Date(iso).getTime() - start) / config.bucketMs)

    for (const ticket of projectTickets.value) {
      const createdBucket = bucketOf(ticket.created_at)
      if (createdBucket >= 0 && createdBucket < config.buckets) created[createdBucket]!++
      if (ticket.status === 'DONE') {
        const resolvedBucket = bucketOf(ticket.updated_at)
        if (resolvedBucket >= 0 && resolvedBucket < config.buckets) resolved[resolvedBucket]!++
      }
    }

    return { labels, created, resolved }
  })

  /** Ticket ancora aperti (tutti gli stati tranne DONE). */
  const openCount = computed(() =>
    projectTickets.value.filter(t => t.status !== 'DONE').length,
  )

  /** Fattura stimata: costo dei ticket risolti nel range selezionato. */
  const invoiceEstimate = computed(() => {
    const config = RANGE_CONFIGS[range.value]
    const start = Date.now() - config.buckets * config.bucketMs
    const doneInRange = projectTickets.value.filter(
      t => t.status === 'DONE' && new Date(t.updated_at).getTime() >= start,
    )
    return totalCost(doneInRange, dailyRate.value)
  })

  /** Costo proiettato: stima su TUTTI i ticket del progetto. */
  const projectedCost = computed(() =>
    totalCost(projectTickets.value, dailyRate.value),
  )

  return { range, trend, openCount, invoiceEstimate, projectedCost, dailyRate }
}
