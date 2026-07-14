import type { User } from '~~/shared/types/user'

/** Tempo relativo in italiano ("2 giorni fa", "1 ora fa", "adesso"). */
export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'adesso'

  const rtf = new Intl.RelativeTimeFormat('it-IT', { numeric: 'always' })
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)

  if (months >= 1) return rtf.format(-months, 'month')
  if (days >= 1) return rtf.format(-days, 'day')
  if (hours >= 1) return rtf.format(-hours, 'hour')
  return rtf.format(-minutes, 'minute')
}

/** Nome completo leggibile di un utente. */
export function fullName(user: User): string {
  return `${user.first_name} ${user.last_name}`.trim() || user.username
}
