/**
 * ★ Punto unico di sostituzione API ★
 *
 * Oggi esporta l'implementazione MOCK; quando il backend Django sarà pronto
 * basterà creare `services/http/*` con le stesse firme (basate su $fetch)
 * e cambiare questi re-export — store e pagine non si toccano.
 */
export * as authService from './mock/auth.service'
export * as projectsService from './mock/projects.service'
export * as ticketsService from './mock/tickets.service'
