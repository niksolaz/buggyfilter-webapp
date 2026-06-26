# DESIGN SYSTEM — BuggyFilter WebApp

> Design system per le tre superfici del prodotto: **Client Portal**, **Operator Dashboard**, **Admin Panel**.
> Metodologia: `/design:design-system` (token → componenti → pattern, con stati e accessibilità).
> Target stack: Nuxt 3/4 + Vue 3, Pinia. Stato: **proposta per MVP** · Data: 2026-06-26

---

## 0. Principi guida

1. **Consistenza prima della creatività** — il design system esiste perché tu non reinventi la ruota a ogni schermata.
2. **Due mondi, un linguaggio** — Client e Operator hanno bisogni opposti (semplicità vs densità informativa) ma condividono token e componenti base.
3. **La sicurezza è anche design** — il cliente non deve *vedere* (né intuire) i campi tecnici (`severity`, `estimated_hours`, `ai_solution`). Il design rafforza l'isolamento dei dati definito in SPECS.
4. **Documenta tutto** — se un componente non è documentato, non esiste.
5. **Mobile-aware** — il Client Portal (chat) sarà usato anche da mobile; l'Operator Dashboard è desktop-first.

### Le tre superfici a colpo d'occhio
| Superficie | Utente | Metafora UI | Densità | Priorità |
|---|---|---|---|---|
| **Client Portal** | Cliente non tecnico | Chat / messaggistica | Bassa, rassicurante | Semplicità, fiducia |
| **Operator Dashboard** | Operatore tecnico | Kanban + dettaglio ticket | Alta, informativa | Efficienza, contesto AI |
| **Admin Panel** | Owner/Admin SaaS | Tabelle + form | Alta | Controllo, gestione tenant/piani |

> Nota MVP: per l'Admin Panel, valuta di usare **Django Admin** (vedi ENGINEERING.md) e applicare solo un minimo di branding — risparmi un'intera superficie di frontend.

---

## 1. Design Tokens

Token come CSS custom properties; mappabili 1:1 su un preset Tailwind/UnoCSS.

### 1.1 Colore — Brand & Semantici
| Token | Valore | Uso |
|---|---|---|
| `--color-brand-600` | `#4F46E5` (indaco) | Azioni primarie, link, focus |
| `--color-brand-500` | `#6366F1` | Hover primario |
| `--color-brand-50` | `#EEF0FF` | Sfondi tenui, badge selezionati |
| `--color-success` | `#16A34A` | Stato `Done`, conferme |
| `--color-warning` | `#D97706` | Stato `In Review`, attenzione |
| `--color-info` | `#2563EB` | Stato `In Progress`, messaggi AI |
| `--color-danger` | `#DC2626` | Errori, severità Critical |

### 1.2 Colore — Severità (SOLO Operator/Admin)
> ⚠️ Questi colori non devono **mai** comparire nel Client Portal: rivelerebbero un campo riservato.

| Token | Valore | Severità |
|---|---|---|
| `--sev-critical` | `#DC2626` | Critical |
| `--sev-high` | `#EA580C` | High |
| `--sev-medium` | `#D97706` | Medium |
| `--sev-low` | `#65A30D` | Low |

### 1.3 Neutrali
| Token | Valore | Uso |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Sfondo base |
| `--color-surface` | `#F8FAFC` | Card, pannelli |
| `--color-border` | `#E2E8F0` | Bordi, divisori |
| `--color-text` | `#0F172A` | Testo primario |
| `--color-text-muted` | `#64748B` | Testo secondario, metadati |

### 1.4 Tipografia
| Token | Valore | Uso |
|---|---|---|
| `--font-sans` | Inter, system-ui, sans-serif | UI generale |
| `--font-mono` | "JetBrains Mono", monospace | Snippet codice, `ai_solution`, riferimenti file |
| `--text-xs … 2xl` | 12 / 14 / 16 / 20 / 24 / 30 px | Scala tipografica |
| Pesi | 400 / 500 / 600 / 700 | Regular → Bold |
| Line-height | 1.5 (corpo) · 1.25 (titoli) | — |

### 1.5 Spaziatura, bordi, ombre, motion
| Categoria | Token | Valori |
|---|---|---|
| Spacing (4px base) | `--space-1…8` | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 |
| Radius | `--radius-sm/md/lg/full` | 6 / 10 / 16 / 9999 px |
| Shadow | `--shadow-sm/md/lg` | elevazioni card / dropdown / modal |
| Motion | `--ease-out` · `--dur` | `cubic-bezier(.16,1,.3,1)` · 150/250ms |

---

## 2. Componenti core

Per ogni componente: variant, stati, accessibilità. Convenzione naming: `Bf` prefix (es. `BfTicketCard`).

### 2.1 `BfButton`
| Variant | Uso |
|---|---|
| `primary` | Azione principale (Invia, Crea ticket) |
| `secondary` | Azione di supporto |
| `ghost` | Azioni a bassa enfasi (annulla, link) |
| `danger` | Azioni distruttive |

| Stato | Visual | Comportamento |
|---|---|---|
| Default | Riempito `brand-600` | — |
| Hover | `brand-500` | cursor pointer |
| Active | leggera scala 0.98 | feedback tattile |
| Disabled | opacità 0.5 | non interattivo |
| Loading | spinner + label | `aria-busy`, input bloccato |

**Accessibilità:** `role=button`, focus ring `2px brand-600`, attivabile con `Enter`/`Space`, target ≥ 44×44px.

### 2.2 `BfTicketCard` (componente cardine)
La card cambia **forma e contenuto in base al ruolo** — è il punto in cui il design system applica la sicurezza field-level.

**Variante Client** (chat-oriented, nessun dato tecnico):
```
┌────────────────────────────────────────┐
│ 🐞  Login non funziona su mobile        │  ← titolo
│ Aperto 2 giorni fa · Aggiornato 1h fa   │  ← metadati neutri
│ ┌────────────────────────────────────┐  │
│ │ Stato:  ● In lavorazione           │  │  ← stato SEMPLIFICATO
│ └────────────────────────────────────┘  │
│ 💬 3 messaggi                            │
└────────────────────────────────────────┘
```

**Variante Operator** (densa, brief AI in evidenza):
```
┌──────────────────────────────────────────────┐
│ #142  Login non funziona su mobile    [HIGH]  │  ← severità (badge)
│ Cliente: ACME · Progetto: webapp-acme         │
│ ⏱ Stima: 4h   👤 Op: Mario   📁 auth/login.ts │  ← metadati tecnici
│ ┌──────────────────────────────────────────┐ │
│ │ 🤖 Brief AI                              │ │
│ │ Probabile race condition nel refresh     │ │  ← ai_solution (mono)
│ │ token. Vedi auth/login.ts:42-58          │ │
│ └──────────────────────────────────────────┘ │
│ [Todo][In Progress][In Review][Done]          │  ← transizione stato
└──────────────────────────────────────────────┘
```

| Property | Tipo | Default | Descrizione |
|---|---|---|---|
| `ticket` | `Ticket` | — | Dati ticket |
| `role` | `'client' \| 'operator'` | `'client'` | Determina i campi mostrati |
| `compact` | `boolean` | `false` | Versione ridotta per liste/Kanban |

| Stato | Visual | Comportamento |
|---|---|---|
| Default | surface + bordo | — |
| Hover | shadow-md, bordo brand | cursor pointer → dettaglio |
| Selected | bordo `brand-600` 2px | — |
| Loading (triage in corso) | skeleton + badge "🤖 Analisi…" | non cliccabile sui campi AI |
| Updated (realtime) | flash brand-50 250ms | richiama l'attenzione sul cambiamento |

**Accessibilità:** `role=article`, titolo come heading, badge severità con testo (non solo colore) + `aria-label`. **Mai** rendere i nodi DOM dei campi tecnici nella variante `client` (non basta `display:none` — vanno esclusi dal markup).

| ✅ Do | ❌ Don't |
|---|---|
| Escludere dal markup client i campi tecnici | Nasconderli solo con CSS |
| Stato cliente in linguaggio semplice ("In lavorazione") | Mostrare enum grezzi ("IN_PROGRESS") |
| Badge severità con icona+testo | Affidarsi al solo colore |

### 2.3 `BfStatusBadge` / `BfSeverityBadge`
- **StatusBadge** (entrambi i mondi): mappa `status` → colore semantico + label. Per il client, label "tradotta" e ridotta (es. `IN_REVIEW` → "Quasi pronto"). Per l'operatore, label tecnica.
- **SeverityBadge** (solo operator/admin): mappa `severity` → token `--sev-*`. Icona + testo per accessibilità.

| Status | Client label | Operator label | Colore |
|---|---|---|---|
| TODO | In coda | Todo | neutro |
| IN_PROGRESS | In lavorazione | In Progress | info |
| IN_REVIEW | Quasi pronto | In Review | warning |
| DONE | Risolto | Done | success |

### 2.4 `BfChatThread` + `BfChatBubble` (cuore del Client Portal)
Tre tipi di mittente, visivamente distinti:
| Mittente | Allineamento | Stile |
|---|---|---|
| Cliente | destra | bolla `brand-600`, testo bianco |
| AI Agent | sinistra | bolla `brand-50`, badge 🤖, eventuale snippet mono |
| Operatore | sinistra | bolla `surface`, badge 👤 |

**Stati:** invio (`sending`, opacità 0.6) · inviato · in attesa risposta AI (`typing…` con 3 puntini animati) · errore (retry).
**Contatore domande AI:** indicatore discreto "Domanda 2 di 3" che comunica al cliente il limite (regola delle 3 domande da PROJECT_STATUS).
**Accessibilità:** `role=log` + `aria-live=polite` sul thread, ogni bolla annuncia il mittente; input con label, invio con `Enter` (Shift+Enter = a capo).

### 2.5 `BfKanbanBoard` + `BfKanbanColumn` (cuore dell'Operator Dashboard)
Quattro colonne (`Todo / In Progress / In Review / Done`), card trascinabili.
| Property | Tipo | Default | Descrizione |
|---|---|---|---|
| `columns` | `Column[]` | 4 stati | Definizione colonne |
| `onDrop` | `(ticket, status) => void` | — | Transizione stato |

| Stato | Comportamento |
|---|---|
| Drag in corso | card sollevata (shadow-lg), colonne target evidenziate |
| Drop valido | card si inserisce, optimistic update (Pinia) |
| Drop su `Done` | trigger notifica cliente (Telegram) + conferma |
| Colonna vuota | empty state illustrato ("Nessun ticket qui") |

**Accessibilità:** drag&drop **deve** avere alternativa da tastiera (sposta con menu/`Space`+frecce) — un Kanban solo-mouse non è accessibile. Annuncia i cambi di colonna con `aria-live`.

### 2.6 Componenti di supporto
`BfInput` / `BfTextarea` (label, validazione, errore con `aria-describedby`) · `BfModal` (focus trap, `Esc` per chiudere) · `BfToast` (feedback realtime, `aria-live`) · `BfAvatar` · `BfEmptyState` · `BfSkeleton` (loading triage) · `BfTable` (Admin).

---

## 3. Pattern

### 3.1 Pattern "Triage in corso" (cross-superficie)
Quando un ticket è appena creato e l'AI sta analizzando:
- **Client**: bolla AI "Sto analizzando il tuo problema…" + eventuale domanda di chiarimento (max 3).
- **Operator**: card con skeleton sui campi AI + badge "🤖 Analisi in corso", finché `ai_solution` non è popolato → poi la card si completa con flash realtime.

### 3.2 Pattern "Doppia vista del ticket" (sicurezza)
Lo **stesso** ticket si renderizza diversamente per ruolo. È il pattern più importante: il componente `BfTicketCard`/`TicketDetail` riceve `role` e i campi tecnici sono **assenti dal markup** lato client, non solo nascosti. Coerente con la Data Access Matrix (FLOW.md §3) e con gli schema API distinti (ENGINEERING.md §3.2).

### 3.3 Pattern "Resolution loop"
`Done` → toast di conferma all'operatore + messaggio automatico nel thread del cliente ("Il tuo problema è stato risolto ✅") + notifica Telegram. Il cliente vede solo l'esito, mai i dettagli tecnici.

### 3.4 Form & validazione
Input raggruppati, errori inline sotto il campo, submit con stato `loading`, prevenzione doppio invio.

---

## 4. Accessibilità (baseline WCAG 2.1 AA)
- **Contrasto** ≥ 4.5:1 per testo, ≥ 3:1 per UI/icone. Verificare i badge severità su sfondo chiaro.
- **Colore mai unico veicolo** d'informazione: severità e stato sempre con icona+testo.
- **Focus visibile** ovunque; ordine di tab logico.
- **Tastiera**: chat (Enter/Shift+Enter), Kanban (alternativa al drag), modali (focus trap + Esc).
- **Screen reader**: `aria-live` su chat/toast, ruoli semantici su card e thread.
- **Target touch** ≥ 44×44px (rilevante per il Client Portal mobile).

---

## 5. Audit dello stato attuale & azioni

### Stato attuale (`clientapp`)
| Voce | Stato |
|---|---|
| Componenti reali | ❌ Solo `app.vue` + 1 pagina boilerplate |
| Token definiti | ❌ Nessuno |
| Libreria UI | ❌ Da scegliere |
| Nuxt versione | ⚠️ `^3.11.0` (doc dicono 4) |

**Punteggio coverage: ~5/100** — è un greenfield. È il momento ideale per fissare i token *prima* di scrivere componenti.

### Priorità (allineate all'MVP 3-4 settimane)
1. **Settimana 1** — Definire i token (questo file) + scegliere UI kit. Raccomandato: **Nuxt UI** o **shadcn-vue** + UnoCSS/Tailwind, per non costruire `BfButton`/`BfInput`/`BfModal` da zero.
2. **Settimana 3** — Costruire i 2 componenti cardine: `BfChatThread` (Client) e `BfKanbanBoard` (Operator). Sono il 80% del valore percepito in demo.
3. **Settimana 3-4** — Implementare il pattern "doppia vista" (`role`) e verificarne la sicurezza (il client non riceve i campi tecnici nemmeno nel payload).
4. **Admin** — Usare **Django Admin** per l'MVP invece di costruire la terza superficie.

### Do's & Don'ts di sistema
| ✅ Do | ❌ Don't |
|---|---|
| Partire un UI kit Vue esistente e tematizzarlo coi token | Costruire ogni primitiva da zero (non c'è tempo) |
| Concentrare l'effort su Chat + Kanban | Curare l'Admin custom (usa Django Admin) |
| Escludere i campi tecnici dal markup client | Fidarsi del solo `v-if`/CSS per nasconderli |
| Riusare i token per entrambe le superfici | Forkare due design separati |

---

## 6. TL;DR
Due superfici opposte (chat semplice per il cliente, dashboard densa per l'operatore) che condividono **token e componenti base**. Il componente più strategico è `BfTicketCard`/`TicketDetail` con prop `role`, perché è lì che il design **applica** la sicurezza field-level escludendo dal markup i campi tecnici per il cliente. Per rispettare le 3-4 settimane: parti da un UI kit Vue, concentra l'effort su **Chat** + **Kanban**, e per l'Admin usa **Django Admin** invece di una terza superficie custom.
