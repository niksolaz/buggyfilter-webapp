import type { ClientTicket, OperatorTicket } from '~~/shared/types/ticket'

/**
 * Serializer di sicurezza: replica lato mock il serializer client dell'API.
 * I campi tecnici vengono RIMOSSI dall'oggetto (non solo nascosti dal tipo),
 * così il payload consegnato alle viste client non li contiene mai.
 */
export function toClientTicket(ticket: OperatorTicket): ClientTicket {
  const { severity, estimated_hours, ai_solution, operator_id, ...clientSafe } = ticket
  return clientSafe
}
