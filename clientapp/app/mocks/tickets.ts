import type { OperatorTicket, Severity, TicketStatus } from '~~/shared/types/ticket'

/**
 * Fixtures ticket generate in modo deterministico (PRNG seedato):
 * stessa sequenza a ogni reload, con date relative a "oggi" così che
 * i range del grafico statistiche (1g / 1s / 1m / 1a) siano sempre popolati.
 */

/** PRNG mulberry32: deterministico dato lo stesso seed. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TITLES = [
  'Login non funziona su mobile',
  'Checkout bloccato al pagamento',
  'Immagini prodotto non caricate',
  'Errore 500 alla registrazione',
  'Notifiche email duplicate',
  'Filtro di ricerca ignora gli accenti',
  'Carrello svuotato dopo il refresh',
  'Layout rotto su Safari',
  'Export PDF con caratteri illeggibili',
  'Timeout sulla dashboard report',
  'Password reset non invia la mail',
  'Totale ordine calcolato male con sconto',
  'Upload avatar fallisce oltre 2MB',
  'Menu mobile non si chiude',
  'Date mostrate in fuso orario sbagliato',
  'Sessione scade troppo presto',
]

const DESCRIPTIONS = [
  'Il problema si presenta in modo sistematico da qualche giorno.',
  'Succede solo ad alcuni utenti, ma è bloccante per chi lo incontra.',
  'Riscontrato sia da desktop che da mobile, browser aggiornato.',
  'Dopo l\'ultimo aggiornamento il comportamento è peggiorato.',
  'Allego gli step per riprodurre il problema, capita quasi sempre.',
]

const AI_SOLUTIONS = [
  'Probabile race condition nel refresh token. Vedi auth/login.ts:42-58.',
  'Il listener non viene rimosso allo smontaggio: memory leak nel componente lista.',
  'Query N+1 sulla lista ordini: aggiungere select_related su cliente.',
  'Manca la validazione lato server del payload: il campo arriva null.',
  'Cache CDN con TTL troppo lungo: gli asset restano alla versione precedente.',
]

const STATUSES: TicketStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
const SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

/** Cliente di riferimento per ogni progetto (vedi mocks/projects.ts). */
const PROJECT_CLIENTS: Record<number, number> = { 1: 4, 2: 5, 3: 6 }
const PROJECT_OPERATORS: Record<number, number[]> = { 1: [1, 2], 2: [2], 3: [1, 2] }

function buildTickets(): OperatorTicket[] {
  const rand = mulberry32(20260714)
  const now = Date.now()
  const DAY = 24 * 60 * 60 * 1000
  const tickets: OperatorTicket[] = []

  for (let i = 0; i < 48; i++) {
    const projectId = (i % 3) + 1
    // I primi 10 ticket cadono negli ultimi 3 giorni (popolano i range brevi),
    // gli altri si distribuiscono sugli ultimi 12 mesi.
    const ageMs = i < 10
      ? rand() * 3 * DAY
      : (3 + rand() * 357) * DAY
    const createdAt = now - ageMs

    // I ticket più vecchi tendono a essere risolti.
    const status: TicketStatus = ageMs > 30 * DAY
      ? (rand() < 0.75 ? 'DONE' : STATUSES[Math.floor(rand() * 4)]!)
      : STATUSES[Math.floor(rand() * 4)]!

    // La risoluzione avviene tra 1 e 10 giorni dalla creazione (mai nel futuro).
    const resolutionMs = Math.min(ageMs * 0.8, (1 + rand() * 9) * DAY)
    const updatedAt = status === 'DONE' ? createdAt + resolutionMs : createdAt + ageMs * 0.2

    const operators = PROJECT_OPERATORS[projectId]!
    tickets.push({
      id: i + 1,
      project_id: projectId,
      client_id: PROJECT_CLIENTS[projectId]!,
      operator_id: status === 'TODO' ? null : operators[Math.floor(rand() * operators.length)]!,
      title: TITLES[i % TITLES.length]!,
      description: DESCRIPTIONS[Math.floor(rand() * DESCRIPTIONS.length)]!,
      status,
      severity: SEVERITIES[Math.floor(rand() * SEVERITIES.length)]!,
      estimated_hours: rand() < 0.85 ? Math.ceil(rand() * 16) : null,
      ai_solution: rand() < 0.6 ? AI_SOLUTIONS[Math.floor(rand() * AI_SOLUTIONS.length)]! : null,
      attachments: [],
      message_count: Math.floor(rand() * 8),
      created_at: new Date(createdAt).toISOString(),
      updated_at: new Date(updatedAt).toISOString(),
    })
  }

  return tickets
}

/**
 * Sorgente dati mutabile condivisa: i service mock leggono e scrivono qui,
 * simulando la persistenza del backend all'interno della sessione.
 */
export const tickets: OperatorTicket[] = buildTickets()
