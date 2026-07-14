/**
 * Guardia globale di autenticazione (mock):
 * - ripristina la sessione da localStorage
 * - non autenticato → /login (tranne le pagine pubbliche)
 * - già autenticato su una pagina pubblica → home del proprio ruolo
 */
const PUBLIC_PATHS = ['/login', '/register']

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  auth.restore()

  const isPublic = PUBLIC_PATHS.includes(to.path)

  if (!auth.isAuthenticated && !isPublic) {
    return navigateTo('/login')
  }
  if (auth.isAuthenticated && isPublic) {
    return navigateTo(auth.homePath)
  }
})
