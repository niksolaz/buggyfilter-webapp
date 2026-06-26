# PROJECT TRANSFER MEMORY: BuggyFilter WebApp
## Context for Default Profile

> **AGGIORNAMENTO 2026-06-26** — Allineato al codice reale. Decisioni architetturali consolidate in `ENGINEERING.md` (backend/ADR) e `DESIGN_SYSTEM.md` (frontend). Il backend è **Django + Django Ninja** (non più Nest.js): il pivot era già avvenuto nel codice ma non era documentato.

### 1. Project Essence
BuggyFilter is an AI-augmented bug tracking system where an LLM acts as a technical intermediary. The AI triages tickets by analyzing the codebase (GitHub API), interviewing the client, and providing operators with a technical brief (Severity, Estimated Time, Possible Solution) while keeping the client isolated from internal technical metrics.

### 2. Current Implementation State
The project is structured in a dedicated directory: `/Users/niksolaz/Claude/Projects/buggyfilter-webapp/`

#### Directory Structure (stato reale):
- `/clientapp`: **Nuxt 3** (`nuxt ^3.11.0`) / Vue 3 — solo boilerplate (`app.vue` + 1 pagina). UI da costruire.
- `/serverapp`: **Django 6.0.6 + Django Ninja 1.6.2** / Python. Modelli migrati, API ancora da implementare (view placeholder). Connesso a **Supabase Postgres** (`DB_HOST=aws-...:6543`, pooler pgBouncer).
- `ENGINEERING.md`: Valutazione architetturale backend + ADR (Django vs Node vs Nuxt full-stack, ruolo Supabase). **Leggere prima di decisioni di stack.**
- `DESIGN_SYSTEM.md`: Token, componenti (chat, kanban, ticket card), pattern sicurezza field-level.
- `SPECS.md`: Specifiche tecniche e schema DB.
- `FLOW.md`: ERD e Flow Charts (Mermaid) — concettualmente ancora validi.

### 3. Key Architectural Decisions
- **Architettura = Nuxt + Django disaccoppiati (headless)** — DECISIONE CONFERMATA. Django+Ninja espone **API REST (JSON)**; Nuxt è un **frontend SPA separato** che la consuma. NON si usano i template/views HTML di Django per l'UI cliente (Ninja è headless, non renderizza HTML).
  - **Client Portal (chat)** → **Nuxt SPA**.
  - **Operator Dashboard (Kanban)** → **Nuxt SPA**.
  - **Admin Panel (gestione tenant/utenti/progetti/piani)** → **Django Admin** (server-rendered, gratis: nessun template scritto a mano). Unica parte non-Nuxt, ed è voluta.
- **Backend = Django + Django Ninja** (consolidato; vedi ADR-001 in `ENGINEERING.md`). Node/Fastify/Nest scartati per l'MVP; Nuxt full-stack era il piano B, ora superato dalla decisione headless.
- **Supabase = Postgres gestito + Realtime** (uso deliberato; vedi ADR-002). La chat real-time la fa Nuxt sottoscrivendosi a Supabase Realtime (no WebSocket custom). ⚠️ Migration sulla porta **5432** (session), runtime sul **6543** (pooler).
- **Multi-Tenancy**: modello `Organization` (software house) → `Project` → `ProjectMember`. `User` è custom (`AbstractUser`) con `role` (CLIENT/OPERATOR/OWNER) e FK a `Organization`.
- **Triage Loop**: Client $\rightarrow$ AI Agent $\rightarrow$ Codebase Analysis $\rightarrow$ Operator Assignment. **Asincrono via n8n** per l'MVP (ADR-003; fallback worker Python). Confine stabile: webhook in → write-back via API Django.
- **Resolution Loop**: Operator (Todo $\rightarrow$ Done) $\rightarrow$ Client Notification (Telegram).
- **Security**: isolamento field-level via **schema Ninja distinti per ruolo** (`TicketClientOut` / `TicketOperatorOut`). I client non vedono `severity`, `estimated_hours`, `ai_solution`.

### 4. Database Schema (Django models → Supabase Postgres)
Stato **implementato** in `serverapp/tickets/models.py`:
- `Organization`: id, name, created_at.
- `User` (custom AbstractUser): + role (CLIENT|OPERATOR|OWNER), organization (FK, nullable).
- `Project`: id, name, description, created_at.
- `ProjectMember`: id, project_id, user_id, role_in_project (unique project+user).
- `Ticket`: id, project_id, client_id, operator_id (nullable), title, description, status (TODO|IN_PROGRESS|IN_REVIEW|DONE), severity (CRITICAL|HIGH|MEDIUM|LOW, nullable), estimated_hours, ai_solution, created_at, updated_at.
- `Message`: id, ticket_id, sender_id, content, timestamp (ordinati per tempo).

**Proposti ma NON ancora nel codice** (vedi `ER_ANALYSIS.md`): tabella `PLAN` (billing/quota token/BYOK), campi `github_url`/`github_token` su `Project`, `ai_agent_id` su `Message`.

### 5. Next Immediate Steps (MVP 3-4 settimane — dettaglio in ENGINEERING.md §6)
- [ ] Sett.1: API Ninja (tickets/messages) + auth JWT + Django Admin; correggere connessione (migration su 5432).
- [ ] Sett.2: `TriageService` (PyGithub + OpenAI, regola 3 domande, BYOK→master key) in worker async.
- [ ] Sett.3: Frontend Nuxt (Chat client + Kanban operatore) + Supabase Realtime; verifica field-level security.
- [ ] Sett.4: Notifica Telegram a `Done`, seed demo, deploy.

### 6. Reference Files
Prima di modifiche architetturali, leggere **`ENGINEERING.md`** e **`DESIGN_SYSTEM.md`**, poi `SPECS.md` e `FLOW.md`.
