# BuggyFilter WebApp - Project Status & Decisions

> **AGGIORNAMENTO 2026-06-26** — Stato riallineato al codice reale. Lo stack backend è **Django + Django Ninja** (non Nest.js); il Triage Engine descritto in precedenza era su un'iterazione Nest.js **non presente** nel codice Django attuale. Decisioni consolidate in `ENGINEERING.md` e `DESIGN_SYSTEM.md`.

## 📌 Vision
BuggyFilter è un sistema di bug tracking potenziato dall'AI che agisce come intermediario tra clienti e operatori tecnici, automatizzando il triage dei ticket tramite l'analisi del codice sorgente su GitHub.

---

## 🛠️ Stato Attuale dello Sviluppo
Il progetto è in fase iniziale. È stato fatto un **pivot di stack** da Nest.js a **Django + Django Ninja**.

### ✅ Implementato (ServerApp — Django)
- **Modelli dati**: `Organization`, `User` (custom AbstractUser con ruoli), `Project`, `ProjectMember`, `Ticket`, `Message`. Migrazioni applicate (2 migration).
- **Infrastructure**: Setup Django 6.0.6 + Django Ninja 1.6.2, connessione a **Supabase Postgres** via `.env`, `AUTH_USER_MODEL` custom.

### ⏳ Da implementare (non ancora nel codice)
- **API endpoints** Ninja (le view sono ancora placeholder `Hello world`).
- **Triage Engine** (PyGithub + OpenAI): la logica descritta nella precedente iterazione Nest.js va **ricostruita in Python** e spostata in un **worker asincrono**.
- **Auth/JWT + RBAC** e isolamento field-level via schema Ninja per ruolo.

### 📌 Nota di portabilità
Il Triage Engine (regola 3 domande, output Severità/Ore/Soluzione/Operatore, modello ibrido API key) resta valido come **specifica logica** — cambia solo il linguaggio di implementazione (Python invece di TypeScript). Le regole di business sotto restano in vigore.

---

## 🧠 Decisioni Architetturali & Regole di Business

### 1. Strategia di Sviluppo
- **Approccio**: Backend-First. Si prioritizza la validazione del "cuore" AI prima di costruire l'interfaccia utente.

### 2. Gestione del Consumo Token & User Experience
- **Limite Interviste**: L'AI non può interrogare il cliente all'infinito.
- **Regola delle 3 Domande**: L'AI ha un massimo di **3 domande** per raccogliere dettagli. Al raggiungimento del limite, l'AI è obbligata a generare il triage finale con le informazioni a disposizione.

### 3. Gestione API Key & Modelli
- **Modello di Gestione**: Approccio **Ibrido**.
  - **Default**: Il sistema utilizzerà una chiave master di sistema per l'onboarding rapido.
  - **Custom**: Sarà implementata la possibilità per i singoli progetti di inserire la propria API Key (Bring Your Own Key - BYOK) per gestire costi e privacy.
- **Logica di Risoluzione**: `Chiave Progetto` $\rightarrow$ se assente $\rightarrow$ `Chiave Master di Sistema`.

---

## 🚀 Roadmap Prossimi Passi
> Piano MVP 3-4 settimane dettagliato in `ENGINEERING.md` §6.

### ✅ Fase 2: Data Persistence (parzialmente fatta)
- [x] Setup **Supabase (PostgreSQL)** + modelli Django migrati.
- [ ] Correggere connessione migration sulla porta **5432** (il `.env` punta al pooler **6543**).
- [ ] Persistenza contatore domande (interaction count) e salvataggio risultati triage.

### Fase 3: API + Triage AI (Django)
- [ ] API Ninja: tickets/messages CRUD con schema per ruolo.
- [ ] `TriageService` Python (PyGithub + OpenAI) in **worker async** (django-q2 / RQ).
- [ ] Auth JWT + RBAC; i Client NON vedono severità/ore/soluzione AI.

### Fase 4: Real-time & UI
- [ ] Sviluppo della `clientapp` (Vue 3 + **Nuxt 3**): Chat client + Kanban operatore (vedi `DESIGN_SYSTEM.md`).
- [ ] Chat in tempo reale via **Supabase Realtime** (no WebSocket custom da costruire).
- [ ] Admin: usare **Django Admin** per l'MVP invece di una UI custom.
