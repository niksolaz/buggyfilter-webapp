import type { TicketStatus, Severity } from '~~/shared/types/ticket'

/**
 * Mapping stato → label per le due superfici (design doc §2.3):
 * il cliente vede un linguaggio semplice, l'operatore la label tecnica.
 */

export const OPERATOR_STATUS_LABELS: Record<TicketStatus, string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
}

export const CLIENT_STATUS_LABELS: Record<TicketStatus, string> = {
  TODO: 'In coda',
  IN_PROGRESS: 'In lavorazione',
  IN_REVIEW: 'Quasi pronto',
  DONE: 'Risolto',
}

/** Colore semantico Nuxt UI per ogni stato (badge). */
export const STATUS_COLORS: Record<TicketStatus, 'neutral' | 'info' | 'warning' | 'success'> = {
  TODO: 'neutral',
  IN_PROGRESS: 'info',
  IN_REVIEW: 'warning',
  DONE: 'success',
}

/** Ordine delle colonne del Kanban operatore. */
export const KANBAN_COLUMNS: { status: TicketStatus, label: string }[] = [
  { status: 'TODO', label: 'ToDo' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'IN_REVIEW', label: 'Review' },
  { status: 'DONE', label: 'Complete' },
]

/**
 * Colonna della Dashboard Cliente: gli stati intermedi collassano
 * in "In coda", DONE diventa "Risolto" (decisione UX).
 */
export function clientColumn(status: TicketStatus): 'open' | 'resolved' {
  return status === 'DONE' ? 'resolved' : 'open'
}

/** Label e colori delle priorità scelte dal cliente (= severity backend). */
export const SEVERITY_META: Record<Severity, { label: string, cssVar: string, icon: string }> = {
  CRITICAL: { label: 'Critical', cssVar: 'var(--sev-critical)', icon: 'i-lucide-flame' },
  HIGH: { label: 'High', cssVar: 'var(--sev-high)', icon: 'i-lucide-arrow-up' },
  MEDIUM: { label: 'Medium', cssVar: 'var(--sev-medium)', icon: 'i-lucide-minus' },
  LOW: { label: 'Low', cssVar: 'var(--sev-low)', icon: 'i-lucide-arrow-down' },
}
