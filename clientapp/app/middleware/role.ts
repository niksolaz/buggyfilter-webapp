import type { Role } from '~~/shared/types/user'

/**
 * Guardia di ruolo: le pagine dichiarano i ruoli ammessi via
 * definePageMeta({ middleware: 'role', roles: [...] }).
 * Ruolo sbagliato → redirect alla home del proprio ruolo.
 */
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const allowedRoles = to.meta.roles as Role[] | undefined

  if (allowedRoles && auth.user && !allowedRoles.includes(auth.user.role)) {
    return navigateTo(auth.homePath)
  }
})
