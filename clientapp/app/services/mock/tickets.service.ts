import { fakeLatency } from './delay'
import { tickets } from '~/mocks/tickets'
import { toClientTicket } from '~/utils/serializers'
import type { ClientTicket, NewTicketInput, OperatorTicket, TicketStatus } from '~~/shared/types/ticket'

/**
 * Servizio ticket MOCK: replica i due serializer dell'API Django.
 * - `fetchOperatorTickets` → payload completo (solo superfici operatore)
 * - `fetchClientTickets`   → payload SENZA campi tecnici (Client Portal)
 */

export async function fetchOperatorTickets(projectId?: number): Promise<OperatorTicket[]> {
  await fakeLatency()
  const list = projectId ? tickets.filter(t => t.project_id === projectId) : tickets
  return list.map(t => ({ ...t }))
}

/** I ticket del cliente passano SEMPRE da toClientTicket: i campi tecnici non lasciano il service. */
export async function fetchClientTickets(clientId: number): Promise<ClientTicket[]> {
  await fakeLatency()
  return tickets
    .filter(t => t.client_id === clientId)
    .map(toClientTicket)
}

export async function updateTicketStatus(ticketId: number, status: TicketStatus): Promise<OperatorTicket> {
  await fakeLatency()
  const ticket = tickets.find(t => t.id === ticketId)
  if (!ticket) throw new Error('Ticket non trovato')
  ticket.status = status
  ticket.updated_at = new Date().toISOString()
  return { ...ticket }
}

/**
 * Creazione da parte del cliente (chatbot): la priorità scelta viene mappata
 * su `severity`, poi non è più visibile né modificabile dal cliente.
 */
export async function createTicket(input: NewTicketInput, clientId: number): Promise<ClientTicket> {
  await fakeLatency()
  const now = new Date().toISOString()
  const ticket: OperatorTicket = {
    id: Math.max(...tickets.map(t => t.id)) + 1,
    project_id: input.project_id,
    client_id: clientId,
    operator_id: null,
    title: input.title,
    description: input.description,
    status: 'TODO',
    severity: input.priority,
    estimated_hours: null,
    ai_solution: null,
    attachments: input.attachments,
    message_count: 0,
    created_at: now,
    updated_at: now,
  }
  tickets.push(ticket)
  return toClientTicket(ticket)
}
