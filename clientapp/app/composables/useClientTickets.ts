import { ticketsService } from '~/services'
import type { ClientTicket, NewTicketInput } from '~~/shared/types/ticket'

/**
 * Stato ticket del Client Portal: usa ESCLUSIVAMENTE il payload ridotto
 * (ClientTicket, senza campi tecnici). Tenuto separato dallo store operatore
 * proprio per non far mai transitare severity/stime/AI nelle viste client.
 */
export function useClientTickets() {
  const auth = useAuthStore()
  const tickets = useState<ClientTicket[]>('client-tickets', () => [])
  const loading = useState('client-tickets-loading', () => false)

  async function fetch() {
    if (!auth.user) return
    loading.value = true
    try {
      tickets.value = await ticketsService.fetchClientTickets(auth.user.id)
    }
    finally {
      loading.value = false
    }
  }

  /** Colonna "In coda": tutto ciò che non è ancora risolto. */
  const openTickets = computed(() =>
    tickets.value
      .filter(t => clientColumn(t.status) === 'open')
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
  )

  /** Colonna "Risolto". */
  const resolvedTickets = computed(() =>
    tickets.value
      .filter(t => clientColumn(t.status) === 'resolved')
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
  )

  /** Crea il ticket dal chatbot; dopo la creazione il cliente non può più modificarlo. */
  async function create(input: NewTicketInput): Promise<ClientTicket> {
    if (!auth.user) throw new Error('Non autenticato')
    const ticket = await ticketsService.createTicket(input, auth.user.id)
    tickets.value = [ticket, ...tickets.value]
    return ticket
  }

  return { tickets, loading, openTickets, resolvedTickets, fetch, create }
}
