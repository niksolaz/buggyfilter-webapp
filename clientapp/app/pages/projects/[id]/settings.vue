<script setup lang="ts">
import type { ProjectRole } from '~~/shared/types/project'
import type { MemberWithUser } from '~/stores/projects'

/**
 * Impostazioni di progetto: inviti clienti via link, gestione del team
 * (aggiunta operatori e modifica ruoli) e tariffa giornaliera usata
 * per le stime di fattura/costo in Statistiche.
 */
definePageMeta({
  layout: 'operator',
  middleware: 'role',
  roles: ['OPERATOR', 'OWNER'],
})

const route = useRoute()
const projectId = computed(() => Number(route.params.id))

const auth = useAuthStore()
const projectsStore = useProjectsStore()
const ticketsStore = useTicketsStore()
const toast = useToast()

// I ticket servono a bloccare la rimozione di clienti con segnalazioni aperte.
await Promise.all([projectsStore.fetchAll(), ticketsStore.fetchAll()])

const project = computed(() => projectsStore.projectById(projectId.value))
useHead({ title: () => project.value ? `${project.value.name} · Impostazioni` : 'Impostazioni' })

// ── Invito clienti via link ────────────────────────────────────────────
const inviteLink = ref('')
const generatingLink = ref(false)

async function generateInvite() {
  generatingLink.value = true
  try {
    inviteLink.value = await projectsStore.createInviteLink(projectId.value)
  }
  finally {
    generatingLink.value = false
  }
}

async function copyInvite() {
  await navigator.clipboard.writeText(inviteLink.value)
  toast.add({ title: 'Link copiato negli appunti', color: 'success', icon: 'i-lucide-clipboard-check' })
}

// ── Team: ruoli e aggiunta operatori ───────────────────────────────────
const roleOptions: { label: string, value: ProjectRole }[] = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Member', value: 'MEMBER' },
  { label: 'Viewer', value: 'VIEWER' },
]

async function changeRole(memberId: number, role: ProjectRole) {
  await projectsStore.updateMemberRole(memberId, role)
  toast.add({ title: 'Ruolo aggiornato', color: 'success', icon: 'i-lucide-check' })
}

const selectedOperatorId = ref<number | undefined>(undefined)
const addingOperator = ref(false)

const operatorOptions = computed(() =>
  projectsStore.availableOperators(projectId.value).map(u => ({
    label: `${fullName(u)} (${u.email})`,
    value: u.id,
  })),
)

async function addOperator() {
  if (!selectedOperatorId.value) return
  addingOperator.value = true
  try {
    await projectsStore.addOperator(projectId.value, selectedOperatorId.value)
    toast.add({ title: 'Operatore aggiunto al progetto', color: 'success', icon: 'i-lucide-user-plus' })
    selectedOperatorId.value = undefined
  }
  catch (e) {
    toast.add({ title: e instanceof Error ? e.message : 'Errore', color: 'error' })
  }
  finally {
    addingOperator.value = false
  }
}

// ── Rimozione membri ───────────────────────────────────────────────────
/** Membro in attesa di conferma; null = modale chiusa. */
const memberToRemove = ref<MemberWithUser | null>(null)
const removing = ref(false)

/** null se rimovibile, altrimenti il motivo del blocco (tooltip). */
function blockReason(member: MemberWithUser) {
  return auth.user ? projectsStore.removalBlockReason(member, auth.user.id) : 'Sessione non valida'
}

async function confirmRemove() {
  const member = memberToRemove.value
  if (!member || !auth.user) return
  removing.value = true
  try {
    await projectsStore.removeMember(member.id, auth.user.id)
    toast.add({
      title: `${fullName(member.user)} non fa più parte del progetto`,
      color: 'success',
      icon: 'i-lucide-user-minus',
    })
    memberToRemove.value = null
  }
  catch (e) {
    toast.add({ title: e instanceof Error ? e.message : 'Errore', color: 'error', icon: 'i-lucide-alert-circle' })
  }
  finally {
    removing.value = false
  }
}

// ── Tariffa giornaliera ────────────────────────────────────────────────
const rateDraft = ref(0)
watch(
  () => projectsStore.dailyRateOf(projectId.value),
  rate => (rateDraft.value = rate),
  { immediate: true },
)

async function saveRate() {
  await projectsStore.setDailyRate(projectId.value, rateDraft.value)
  toast.add({
    title: 'Tariffa aggiornata',
    description: 'Le stime in Statistiche sono state ricalcolate.',
    color: 'success',
    icon: 'i-lucide-check',
  })
}
</script>

<template>
  <div v-if="project">
    <BfProjectHeader :project-id="projectId" />

    <div class="flex max-w-3xl flex-col gap-6">
      <!-- Invita clienti -->
      <section class="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
        <h2 class="font-semibold text-[var(--color-text)]">
          Invita un cliente
        </h2>
        <p class="mt-1 text-sm text-[var(--color-text-muted)]">
          Genera un link di invito da condividere: chi lo apre entra nel progetto come cliente.
        </p>
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <UButton
            label="Genera link di invito"
            icon="i-lucide-link"
            variant="outline"
            :loading="generatingLink"
            @click="generateInvite"
          />
          <template v-if="inviteLink">
            <UInput
              :model-value="inviteLink"
              readonly
              class="min-w-64 flex-1"
              aria-label="Link di invito generato"
            />
            <UButton
              icon="i-lucide-copy"
              color="neutral"
              variant="ghost"
              aria-label="Copia il link di invito"
              @click="copyInvite"
            />
          </template>
        </div>
      </section>

      <!-- Team -->
      <section class="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
        <h2 class="font-semibold text-[var(--color-text)]">
          Team del progetto
        </h2>

        <table class="mt-4 w-full text-sm">
          <thead>
            <tr class="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              <th class="pb-2 pr-4 font-semibold">
                Membro
              </th>
              <th class="pb-2 pr-4 font-semibold">
                Tipo
              </th>
              <th class="pb-2 pr-4 font-semibold">
                Ruolo nel progetto
              </th>
              <th class="pb-2 text-right font-semibold">
                <span class="sr-only">Azioni</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="member in projectsStore.membersOf(projectId)"
              :key="member.id"
              class="border-b border-[var(--color-border)] last:border-0"
            >
              <td class="py-3 pr-4">
                <div class="flex items-center gap-2">
                  <UAvatar
                    :alt="fullName(member.user)"
                    size="xs"
                  />
                  <div>
                    <p class="font-medium text-[var(--color-text)]">
                      {{ fullName(member.user) }}
                    </p>
                    <p class="text-xs text-[var(--color-text-muted)]">
                      {{ member.user.email }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="py-3 pr-4">
                <UBadge
                  :color="member.user.role === 'CLIENT' ? 'neutral' : 'primary'"
                  variant="subtle"
                  size="sm"
                >
                  {{ member.user.role === 'CLIENT' ? 'Cliente' : member.user.role === 'OWNER' ? 'Owner' : 'Operatore' }}
                </UBadge>
              </td>
              <td class="py-3 pr-4">
                <USelect
                  :model-value="member.role_in_project"
                  :items="roleOptions"
                  size="sm"
                  class="w-32"
                  :aria-label="`Ruolo di ${fullName(member.user)} nel progetto`"
                  @update:model-value="value => changeRole(member.id, value as ProjectRole)"
                />
              </td>
              <td class="py-3 text-right">
                <UTooltip :text="blockReason(member) ?? 'Rimuovi dal progetto'">
                  <UButton
                    icon="i-lucide-user-minus"
                    color="error"
                    variant="ghost"
                    size="sm"
                    :disabled="blockReason(member) !== null"
                    :aria-label="`Rimuovi ${fullName(member.user)} dal progetto`"
                    @click="memberToRemove = member"
                  />
                </UTooltip>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Aggiungi operatore -->
        <div class="mt-4 border-t border-[var(--color-border)] pt-4">
          <p class="mb-2 text-sm font-medium text-[var(--color-text)]">
            Aggiungi un operatore
          </p>
          <div class="flex flex-wrap items-center gap-2">
            <USelect
              v-model="selectedOperatorId"
              :items="operatorOptions"
              placeholder="Seleziona un operatore…"
              class="min-w-64"
              :disabled="!operatorOptions.length"
              aria-label="Operatore da aggiungere al progetto"
            />
            <UButton
              label="Aggiungi"
              icon="i-lucide-user-plus"
              :disabled="!selectedOperatorId"
              :loading="addingOperator"
              @click="addOperator"
            />
          </div>
          <p
            v-if="!operatorOptions.length"
            class="mt-2 text-xs text-[var(--color-text-muted)]"
          >
            Tutti gli operatori dell'organizzazione fanno già parte del progetto.
          </p>
        </div>
      </section>

      <!-- Tariffa giornaliera -->
      <section class="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
        <h2 class="font-semibold text-[var(--color-text)]">
          Tariffa giornaliera
        </h2>
        <p class="mt-1 text-sm text-[var(--color-text-muted)]">
          Usata per stimare la fattura e il costo di risoluzione in Statistiche
          (costo ticket = ore stimate / {{ HOURS_PER_DAY }} × tariffa).
        </p>
        <div class="mt-4 flex items-center gap-2">
          <UInputNumber
            v-model="rateDraft"
            :min="0"
            :step="10"
            :format-options="{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }"
            class="w-40"
            aria-label="Tariffa giornaliera in euro"
          />
          <UButton
            label="Salva"
            :disabled="rateDraft === projectsStore.dailyRateOf(projectId)"
            @click="saveRate"
          />
        </div>
      </section>
    </div>

    <!-- Conferma rimozione: azione distruttiva, mai in un click solo -->
    <UModal
      :open="memberToRemove !== null"
      title="Rimuovere dal progetto?"
      :description="memberToRemove
        ? `${fullName(memberToRemove.user)} perderà l'accesso a ${project.name}. Puoi aggiungere di nuovo questa persona in qualsiasi momento.`
        : ''"
      @update:open="value => { if (!value) memberToRemove = null }"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            label="Annulla"
            color="neutral"
            variant="ghost"
            :disabled="removing"
            @click="memberToRemove = null"
          />
          <UButton
            label="Rimuovi"
            color="error"
            icon="i-lucide-user-minus"
            :loading="removing"
            @click="confirmRemove"
          />
        </div>
      </template>
    </UModal>
  </div>

  <BfEmptyState
    v-else
    icon="i-lucide-folder-x"
    title="Progetto non trovato"
  >
    <UButton
      to="/operator"
      label="Torna alla dashboard"
      variant="outline"
      color="neutral"
      size="sm"
    />
  </BfEmptyState>
</template>
