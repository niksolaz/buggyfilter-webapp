import { defineStore } from 'pinia'
import { authService } from '~/services'
import type { User } from '~~/shared/types/user'

const SESSION_KEY = 'bf-session'

/**
 * Sessione utente mock: persiste in localStorage così il refresh
 * non butta fuori l'utente. Verrà sostituita da token/cookie reali.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => user.value !== null)

  /** Home di destinazione in base al ruolo. */
  const homePath = computed(() =>
    user.value?.role === 'CLIENT' ? '/client' : '/operator',
  )

  /** Ripristina la sessione da localStorage (chiamata dal middleware). */
  function restore() {
    if (user.value) return
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      user.value = JSON.parse(raw) as User
    }
  }

  async function login(email: string, password: string) {
    user.value = await authService.login(email, password)
    localStorage.setItem(SESSION_KEY, JSON.stringify(user.value))
  }

  function logout() {
    user.value = null
    localStorage.removeItem(SESSION_KEY)
  }

  return { user, isAuthenticated, homePath, restore, login, logout }
})
