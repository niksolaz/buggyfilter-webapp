# BuggyFilter WebApp - Project Status & Decisions

## 📌 Vision
BuggyFilter è un sistema di bug tracking potenziato dall'AI che agisce come intermediario tra clienti e operatori tecnici, automatizzando il triage dei ticket tramite l'analisi del codice sorgente su GitHub.

---

## 🛠️ Stato Attuale dello Sviluppo
Il progetto è in fase iniziale. È stata completata la **Fase 1 (Triage Engine)**.

### ✅ Implementato (ServerApp)
- **Triage Engine**: Sistema funzionale che integra GitHub API (Octokit) e LLM (OpenAI).
- **Flusso di Analisi**: Il sistema è in grado di:
  1. Ricevere un report di bug.
  2. Cercare file rilevanti nel repository GitHub.
  3. Generare un brief tecnico con Severità, Ore Stimate, Soluzione suggerita e Operatore Target.
- **API Endpoint**: Implementato `POST /triage` per l'invio e il processamento dei bug.
- **Infrastructure**: Setup di Nest.js con gestione variabili d'ambiente via `.env`.

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

### Fase 2: Data Persistence & Infrastructure (Prossimo Step)
- [ ] Setup di **Supabase (PostgreSQL)**.
- [ ] Creazione tabelle: `users`, `projects`, `tickets`, `messages`.
- [ ] Implementazione del persistente per il contatore di domande (interaction count).
- [ ] Salvataggio automatico dei risultati del triage nel DB.

### Fase 3: Auth & RBAC
- [ ] Implementazione JWT.
- [ ] Controllo accessi: i Client NON devono vedere i campi tecnici del triage (severità, ore, soluzione AI).

### Fase 4: Real-time & UI
- [ ] Sviluppo della `clientapp` (Vue 3 + Nuxt 4).
- [ ] Integrazione WebSocket per chat in tempo reale.
