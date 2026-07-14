import type { OperatorTicket } from '~~/shared/types/ticket'

/**
 * Logica di stima costi/fattura.
 * Formula: costo ticket = (ore stimate / ore giornata) × tariffa giornaliera.
 */

/** Ore di una giornata lavorativa. */
export const HOURS_PER_DAY = 8

/** Fallback per i ticket senza stima, così i totali restano coerenti. */
export const DEFAULT_ESTIMATED_HOURS = 4

/** Costo stimato di un singolo ticket data la tariffa giornaliera (EUR). */
export function ticketCost(ticket: OperatorTicket, dailyRate: number): number {
  const hours = ticket.estimated_hours ?? DEFAULT_ESTIMATED_HOURS
  return (hours / HOURS_PER_DAY) * dailyRate
}

/** Somma dei costi stimati di una lista di ticket. */
export function totalCost(tickets: OperatorTicket[], dailyRate: number): number {
  return tickets.reduce((sum, t) => sum + ticketCost(t, dailyRate), 0)
}

/** Formatta un importo in EUR (it-IT). */
export function formatEur(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}
