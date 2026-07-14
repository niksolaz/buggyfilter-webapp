/**
 * Tipi ticket — rispecchiano il modello Ticket del backend Django.
 *
 * Regola centrale del prodotto: il cliente NON deve mai ricevere
 * `severity`, `estimated_hours`, `ai_solution`. Per questo esistono due
 * tipi distinti (OperatorTicket / ClientTicket) che rispecchiano i due
 * serializer che avrà l'API.
 */

export type TicketStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'

/** Severità tecnica: coincide con la priorità scelta dal cliente alla creazione. */
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

/** Allegato immagine caricato dal cliente alla creazione (max 3). */
export interface TicketAttachment {
  id: string
  name: string
  /** Object URL (mock) o URL remoto (futura API). */
  url: string
}

/** Payload completo del ticket, visibile a operatori e owner. */
export interface OperatorTicket {
  id: number
  project_id: number
  client_id: number
  operator_id: number | null
  title: string
  description: string
  status: TicketStatus
  severity: Severity | null
  estimated_hours: number | null
  ai_solution: string | null
  attachments: TicketAttachment[]
  message_count: number
  created_at: string
  updated_at: string
}

/**
 * Payload ridotto per il cliente: i campi tecnici sono RIMOSSI dal tipo,
 * quindi renderizzarli in una vista client è un errore di compilazione.
 */
export type ClientTicket = Omit<OperatorTicket, 'severity' | 'estimated_hours' | 'ai_solution' | 'operator_id'>

/** Dati raccolti dal chatbot per creare un nuovo ticket lato cliente. */
export interface NewTicketInput {
  project_id: number
  title: string
  description: string
  priority: Severity
  attachments: TicketAttachment[]
}
