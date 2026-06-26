# ENGINEERING — BuggyFilter WebApp

> Valutazione architetturale del backend e system design per l'MVP.
> Metodologia: `/engineering:system-design` + `/engineering:architecture` (ADR).
> Data: 2026-06-26 · Stato: **Proposta per decisione** · Decisore: NikSolaz

---

## 0. Nota preliminare: documentazione ≠ codice reale

Prima di valutare, va corretto un disallineamento importante che ho trovato leggendo i `.md` e ispezionando il codice:

| Cosa dicono i doc (SPECS / TRANSFER_MEMORY / PROJECT_STATUS) | Cosa c'è davvero nel codice (`serverapp/`) |
|---|---|
| Backend **Nest.js / TypeScript** su porta 3000 | Backend **Django 6.0.6 + Django Ninja 1.6.2** (`manage.py`, `core/settings.py`) |
| Triage Engine "completato" (Octokit + OpenAI) | View ancora **placeholder** (`HttpResponse("Hello, world")`), nessun triage nel codice Django |
| Database "Supabase (PostgreSQL)" | `ENGINE = postgresql`, `DB_HOST = aws-...:6543` → **pooler Supabase (pgBouncer)**. Modelli già migrati (2 migration) |
| `clientapp` Nuxt **4** | `package.json` → `nuxt ^3.11.0` (Nuxt **3**), solo boilerplate (`app.vue` + 1 pagina) |

**Conclusione:** il progetto ha già fatto un *pivot* da Nest.js a Django, ma la documentazione non è stata aggiornata. La domanda che poni ("ha senso Django? ha senso Supabase? non era meglio Node/Fastify/Nest? non era meglio tutto Nuxt 4?") è quindi quanto mai pertinente: stai valutando di consolidare o ribaltare una scelta già in corso. Questo documento parte dallo **stato reale del codice**, non dai doc.

---

## 1. Requirements (sintesi)

### 1.1 Requisiti funzionali
- **Multi-tenant**: una software house gestisce più progetti/clienti isolati (`Organization` → `Project` → `ProjectMember`).
- **Reporting bug via chat**: il cliente apre un ticket conversando.
- **Triage AI**: LLM + GitHub API analizzano il codice, intervistano il cliente (**max 3 domande**), producono `severity`, `estimated_hours`, `ai_solution`, operatore target.
- **Dashboard operatori**: Kanban (`Todo → In Progress → In Review → Done`).
- **Sicurezza field-level**: il cliente non deve MAI vedere `severity`, `estimated_hours`, `ai_solution`.
- **Notifiche**: messaggio al cliente a ticket `Done` (Telegram previsto).
- **SaaS / billing**: piani, quota token, BYOK (Bring Your Own Key) per LLM.

### 1.2 Requisiti non-funzionali
| Dimensione | Target MVP |
|---|---|
| Scala | Decine di tenant, decine di ticket/giorno. **Non** è un problema di throughput. |
| Latenza | Triage AI = secondi/decine di secondi (LLM + GitHub) → **lavoro asincrono**, non request/response sincrona. |
| Disponibilità | Best-effort da demo. No HA. |
| Costo | Minimo (free tier Supabase + 1 host backend + hosting frontend). |
| Time-to-market | **3-4 settimane** (vincolo dominante). |
| Team | **Tu, in pair programming con AI**. Skill: Nuxt/Vue **senior**, TS **medio**, Node/Fastify **base-medio**, Python/Django **base**. |

### 1.3 Vincoli che pesano sulla decisione
1. **Time-to-market 3-4 settimane** → vince ciò che riusa lavoro già fatto e le tue competenze forti.
2. **Triage AI deve funzionare davvero in demo** → l'orchestrazione LLM+GitHub è il pezzo critico, non l'UI.
3. **Pair programming con AI** → il gap "Django principiante" è attenuato (l'AI copre la sintassi), ma resta tuo l'onere di debuggare ciò che non padroneggi.

---

## 2. Il nodo vero: non è "quale framework", è "quale architettura coerente"

La tua lista di opzioni (Django, Node/Fastify, Nest, Nuxt 4 full-stack) mescola due decisioni indipendenti:

- **A) Dove vive la logica di business e l'orchestrazione AI?** (il "backend")
- **B) Che ruolo dai a Supabase?** (solo Postgres gestito? oppure Auth + RLS + Realtime + Storage?)

Il problema dell'attuale combinazione **Django + Supabase** è che è un *mezzo matrimonio*: usa Supabase **solo come Postgres** e butta via il 80% del suo valore (Auth, RLS, Realtime, auto-API, Storage), perché Django si gestisce auth, API e permessi da solo. In più introduce attriti concreti (vedi §5). Le architetture **coerenti** sono solo due:

| | **Architettura "Supabase-native"** | **Architettura "Django-native"** |
|---|---|---|
| Backend | Nuxt 4 full-stack (Nitro server routes) | Django + Django Ninja |
| Auth | Supabase Auth | Django auth (già `AbstractUser` custom) |
| DB | Supabase Postgres | Postgres (Supabase come host, o qualsiasi) |
| Realtime chat | Supabase Realtime (nativo) | Django Channels **oppure** Supabase Realtime in lettura |
| Admin panel | Supabase Studio (DB) + UI custom | **Django Admin (gratis)** |
| Linguaggio | **Un solo** linguaggio (TS) | Due linguaggi (Python + TS) |
| Ecosistema AI | OpenAI SDK JS + Octokit (ottimi) | OpenAI SDK Python + PyGithub (lo standard) |

Tutto il resto (Nest, Fastify come servizi separati) sono varianti che, per questo MVP, aggiungono complessità senza pagare un dividendo entro 4 settimane.

---

## 3. High-level design (architettura raccomandata)

```
                         ┌──────────────────────────────────────┐
                         │        FRONTEND — Nuxt 3/4 (Vue)      │
                         │  • Client Portal (chat)               │
                         │  • Operator Dashboard (Kanban)        │
                         │  • Admin Panel (light)                │
                         └───────────────┬──────────────────────┘
                          REST (Ninja)   │   Realtime subscribe
                                         │   (messages/tickets)
                ┌────────────────────────┼─────────────────────────┐
                │                        │                         │
        ┌───────▼────────┐      ┌────────▼─────────┐      ┌────────▼─────────┐
        │ Django + Ninja │      │  Supabase        │      │  Orchestratore   │
        │  API REST      │◄────►│  Postgres (DB)   │◄────►│  triage async    │
        │  Auth (JWT)    │ ORM  │  Realtime (WAL)  │webhook│  n8n (MVP)       │
        │  RBAC field-lvl│◄─────┼──────────────────┼──────│  o worker Python │
        └───────┬────────┘write-back (PATCH API)   │      └────────┬─────────┘
                │  Django Admin (tenant/plan/user mgmt) gratis              │
                │  Triage: vedi ADR-003 (§5bis)                            │
        ┌───────▼───────────────────────────────────────────────────────▼─┐
        │  Integrazioni esterne:  OpenAI API  ·  GitHub API (PyGithub)      │
        │                         Telegram Bot API (notifiche)             │
        └──────────────────────────────────────────────────────────────────┘
```

**Idea chiave (ibrido elegante):** Django resta la fonte di verità e scrive su Postgres. Per la chat in tempo reale **non costruisci WebSocket**: il frontend Nuxt si sottoscrive a **Supabase Realtime**, che legge il Write-Ahead-Log di Postgres a prescindere da chi ha scritto. Django scrive un `Message`, il client lo vede comparire live. Zero infrastruttura WebSocket da mantenere, e Supabase smette di essere "solo un Postgres".

### 3.1 Flusso del triage (asincrono)
```
POST /api/tickets (client)
   └─► Django crea Ticket(status=TODO) + Message iniziale
       └─► trigger triage (webhook n8n / enqueue worker)  (ritorna subito 202)
            └─► Orchestratore (n8n o worker Python — vedi ADR-003 §5bis):
                 1. GitHub: cerca file rilevanti nel repo del Project
                 2. LLM: valuta se servono chiarimenti
                    • se sì e domande < 3 → scrive Message AI (domanda) → STOP (re-trigger alla risposta)
                    • se no / 3 domande raggiunte → genera brief
                 3. write-back ticket (PATCH API Django): severity, estimated_hours, ai_solution, operator_id
                 4. (Realtime notifica il frontend del cambiamento)
```
Il triage **non** può stare in una request HTTP sincrona: una chiamata LLM + GitHub può durare 10-40s e va messa in coda/workflow asincrono. Questo vale per **qualsiasi** backend tu scelga. La scelta tra **n8n** e **worker Python** è formalizzata in **ADR-003 (§5bis)**.

### 3.2 Sicurezza field-level (il requisito più delicato)
Il cliente non deve vedere `severity / estimated_hours / ai_solution`. Va applicato **a livello di API/serializzazione**, non solo di UI:
- **Schema Ninja distinti**: `TicketClientOut` (senza campi tecnici) vs `TicketOperatorOut` (completo). La scelta dello schema dipende dal ruolo nel JWT.
- **Mai** affidarsi al solo nascondere i campi in frontend.
- Se un giorno passi a Supabase-native con RLS: ricorda che RLS è *row*-level; per nascondere *colonne* per ruolo servono **viste Postgres dedicate** (es. `tickets_client_view`). È un motivo in più per cui, con il requisito field-level, un backend applicativo (Django/Ninja) è più diretto del solo RLS.

---

## 4. ADR-001 — Scelta del backend per l'MVP

**Status:** Proposed · **Date:** 2026-06-26 · **Deciders:** NikSolaz

### Context
Backend già pivotato a Django+Ninja con modelli migrati su Supabase Postgres, ma API e triage non ancora implementati. Frontend Nuxt appena abbozzato. Serve un MVP con triage AI **funzionante** in **3-4 settimane**, sviluppato da un dev Nuxt-senior / Django-principiante in pair con AI. Domanda: consolidare Django o ribaltare verso Node (Fastify/Nest) o verso Nuxt full-stack?

### Decision (raccomandazione)
**Consolidare su Django + Django Ninja**, rendendo però *deliberato* l'uso di Supabase (Postgres + Realtime in lettura), usando **Django Admin** come pannello SaaS dell'MVP e spostando il triage in un **worker asincrono**. Frontend Nuxt come SPA che consuma l'API REST di Ninja e si sottoscrive a Supabase Realtime per la chat.

### Opzioni considerate

#### Opzione A — Django + Django Ninja (+ Supabase Postgres/Realtime) ✅ raccomandata
| Dimensione | Valutazione |
|---|---|
| Complessità | Media |
| Costo | Basso |
| Scalabilità | Più che sufficiente per il target |
| Time-to-market | **Alto** (modelli già fatti, Admin gratis) |
| Familiarità team | Bassa (Django principiante) → mitigata da AI pairing |

**Pro:**
- **Riusa il lavoro già fatto**: 6 modelli (Organization, User custom, Project, ProjectMember, Ticket, Message) già scritti e migrati. Zero rework.
- **Django Admin = pannello admin SaaS gratuito**: gestione tenant, utenti, progetti, piani senza scrivere UI. Per un MVP è un acceleratore enorme (ti risparmia ~1 settimana di frontend admin).
- **Ecosistema Python per l'AI**: OpenAI SDK, PyGithub, eventuale LangChain — è il terreno più ricco e documentato per l'orchestrazione LLM.
- **ORM + migration di Django**: tra i migliori per un dominio relazionale multi-tenant.
- **Field-level security** banale con schema Ninja distinti per ruolo.

**Contro:**
- Sei principiante Django → curva di apprendimento (attenuata dall'AI pairing, ma il debug resta tuo).
- Due linguaggi/contesti (Python backend, TS frontend).
- Async (worker) e Realtime vanno configurati: serve un task queue (Celery/RQ/`django-q2`) e collegare Supabase Realtime.
- Attenzione al **pooler Supabase** (vedi §5): le migration vogliono la porta **5432** (session), non la 6543.

#### Opzione B — Nuxt 4 full-stack (Nitro) + Supabase-native
| Dimensione | Valutazione |
|---|---|
| Complessità | Bassa-media |
| Costo | Basso |
| Scalabilità | Buona per il target (occhio ai timeout serverless sul triage) |
| Time-to-market | **Alto** (un solo linguaggio, sei senior) |
| Familiarità team | **Alta** (Nuxt senior) |

**Pro:**
- **Un solo linguaggio e un solo repo**, nella tecnologia in cui sei **senior** → massima velocità per *te*.
- Supabase usato a pieno: **Auth + RLS + Realtime + Storage** out-of-the-box. La chat è gratis con Realtime.
- Octokit e OpenAI SDK JS sono ottimi: il triage in TS è del tutto fattibile.
- Niente "mezzo matrimonio": l'architettura è coerente.

**Contro:**
- **Butti via** i modelli Django già fatti (rework dello schema in SQL/migration Supabase).
- Nitro è meno strutturato di Django/Nest per logica di business complessa (triage, accounting token): rischio "spaghetti" nei `server/api`.
- **Field-level security via RLS**: RLS è row-level; per nascondere colonne per ruolo servono viste dedicate → più attenzione.
- Triage long-running su server route serverless → rischio **timeout**: serve comunque una coda/edge function/worker.
- Nessun equivalente di Django Admin: il pannello tenant/piani lo costruisci a mano.

#### Opzione C — Node.js + Fastify **o** NestJS (+ Supabase Postgres)
| Dimensione | Valutazione |
|---|---|
| Complessità | Media (Fastify) / Alta (Nest) |
| Costo | Basso |
| Scalabilità | Buona |
| Time-to-market | **Basso** per questo contesto |
| Familiarità team | Media (Node base-medio) |

**Pro:**
- Un solo linguaggio con il frontend (TS).
- Nest è strutturalmente simile a Django (moduli, DI) → buona organizzazione.
- Octokit nativo, WebSocket nativo.

**Contro:**
- **Butta via il lavoro Django** *e* non gioca sul tuo punto di forza (Nuxt). Il peggio dei due mondi rispetto ad A e B.
- Nest ha una curva ripida (decoratori, moduli, provider): per un principiante-medio Node non è "veloce".
- Devi ricostruire i modelli (Prisma/TypeORM) e ri-disegnare le migration.
- Nessun admin gratis.
- Non c'è un guadagno entro le 4 settimane che giustifichi il pivot.

### Trade-off analysis
La decisione si gioca su **due forze opposte**:
1. **"Velocità sfruttando ciò che già esiste"** → punta su **A (Django)**: modelli fatti + Admin gratis + ecosistema AI Python. Il triage, che "deve funzionare in demo", è più rapido da costruire dove l'ecosistema LLM è più maturo.
2. **"Velocità sfruttando le tue competenze"** → punta su **B (Nuxt full-stack)**: sei senior, un solo linguaggio, Supabase fa metà del lavoro.

**C (Node/Fastify/Nest) è dominata**: paga il costo del pivot (come B) ma senza il vantaggio del tuo skill senior (come B) né del riuso Django (come A). Da scartare per l'MVP.

La scelta tra A e B dipende da **quanto valore dai a**: (i) i modelli Django già fatti, (ii) il pannello admin gratuito, (iii) l'ecosistema AI Python — **contro** (iv) restare al 100% nel linguaggio che padroneggi.

**Raccomandazione netta:** dato che (a) i modelli sono **già migrati**, (b) Django Admin ti regala l'intero pannello SaaS, (c) il triage AI — il pezzo che "deve funzionare" — vive meglio in Python, e (d) il pair programming con AI abbassa il rischio "Django principiante" → **consolida su Django (Opzione A)**. È il percorso che, *oggi*, è più vicino a un MVP funzionante.

> **Quando sceglierei B invece:** se i modelli Django fossero ancora vuoti (non lo sono), o se rifiutassi di toccare Python anche con l'AI a fianco, o se la chat real-time/collaborazione fosse il cuore del prodotto più del triage. In quel caso Nuxt full-stack + Supabase-native è la scelta più veloce *per te*. È un piano B legittimo, non un errore.

### Consequences
**Diventa più facile:**
- Avere subito un pannello di gestione (Django Admin).
- Costruire il triage con strumenti AI Python maturi.
- Mantenere coerenza dei dati (ORM + migration robuste).

**Diventa più difficile / da presidiare:**
- Configurare correttamente la coda asincrona e il collegamento Supabase Realtime.
- Gestire due linguaggi/contesti.
- Evitare i foot-gun del pooler Supabase (porta 6543 vs 5432).

**Da rivedere quando il prodotto cresce:**
- Se il volume di triage cresce molto → worker dedicati, rate-limiting per tenant, caching dell'indicizzazione GitHub.
- Se la collaborazione real-time diventa centrale → valutare Channels o spostare più logica verso Supabase Realtime.
- Auth: per l'MVP **scegli UNA** sola sorgente (Django auth, dato che hai già `AbstractUser`). Non mischiare Supabase Auth e Django auth.

### Action items
1. [ ] Aggiornare SPECS/TRANSFER_MEMORY: backend = **Django + Ninja** (non Nest.js).
2. [ ] Decidere auth: **Django JWT** (raccomandato) e NON Supabase Auth, per non sdoppiare l'identità.
3. [ ] Correggere connessione DB: migration su **porta 5432** (session), runtime su 6543 (pooler) — vedi §5.
4. [ ] Implementare API Ninja: tickets CRUD + invio messaggi, con schema `TicketClientOut` / `TicketOperatorOut`.
5. [ ] Orchestrazione triage asincrona: **n8n** per l'MVP (vedi ADR-003 §5bis); fallback worker Python (`django-q2`/RQ).
6. [ ] Implementare `TriageService` (PyGithub + OpenAI, regola 3 domande, BYOK→master key fallback).
7. [ ] Collegare Supabase Realtime in lettura su `messages`/`tickets` dal frontend Nuxt.
8. [ ] Notifiche: webhook Telegram alla transizione `Done`.

---

## 5. ADR-002 — Ruolo di Supabase (ha senso con Django?)

**Status:** Proposed · **Date:** 2026-06-26

### Context
Oggi Supabase è usato **solo come Postgres gestito** (Django ORM gestisce tutto il resto). Domanda: ha senso pagare la dipendenza Supabase usandone una frazione? E il `DB_HOST` punta al pooler `:6543`.

### Decisione
**Sì, ha senso**, ma va reso *deliberato*: Supabase = **Postgres gestito + Realtime** (e Storage se serviranno allegati). NON usare Supabase Auth/RLS in parallelo a Django auth nell'MVP. Così Supabase smette di essere ridondante e aggiunge la chat real-time quasi gratis.

### Trade-off & note operative
- **Pro tenere Supabase**: Postgres gestito con backup/dashboard (Studio) senza gestire un DB tuo; **Realtime** per la chat senza scrivere WebSocket; Storage pronto per allegati ai bug (screenshot/log); free tier generoso per un MVP/demo.
- **Contro / attriti reali da conoscere:**
  - **Pooler vs migration**: il pooler in *transaction mode* (`:6543`, pgBouncer) **non** supporta i prepared statement che Django usa nelle migration → errori tipici. **Regola:** `migrate` e operazioni schema sulla **porta 5432** (session/diretta); runtime applicativo sul **6543** (pooler). Configura due connessioni o cambia porta al bisogno.
  - **Doppio sistema di migrazioni**: tieni le **migration di Django come unica fonte di verità** dello schema. Non modificare le tabelle da Supabase Studio "a mano", o divergi.
  - **Underuse consapevole**: stai rinunciando ad Auth/RLS/auto-API di Supabase. Va bene: con Django quelle funzioni le hai già a livello applicativo. L'importante è non *duplicarle*.
- **Alternativa**: se in futuro andassi su Nuxt full-stack (Opzione B/ADR-001), allora Supabase va usato a **pieno** (Auth+RLS+Realtime): è lì che dà il massimo.

### Consequences
- Facile: chat real-time e hosting DB senza ops.
- Da presidiare: la disciplina migration/porta e "schema solo da Django".

---

## 5bis. ADR-003 — Orchestrazione del triage: n8n vs worker Python

**Status:** Proposed · **Date:** 2026-06-26 · **Deciders:** NikSolaz

### Context
Il triage AI (GitHub + LLM + regola 3 domande + assegnazione operatore) è lavoro **asincrono e long-running** (10-40s per chiamata). ADR-001 prevedeva un worker Python (Celery/RQ/django-q2). Si valuta in alternativa **n8n** (orchestratore di workflow open-source, node-based) come livello di orchestrazione, dato che offre nodi nativi per GitHub, OpenAI, Postgres/HTTP e Telegram e gestisce code/retry out-of-the-box. Vincolo dominante: MVP 3-4 settimane, dev con Django base.

### Decision (raccomandazione)
**Per l'MVP, usare n8n** come orchestratore del triage e delle notifiche. Django resta thin source-of-truth (CRUD + Admin + API). Il confine è stabile e disaccoppiato: **webhook in → write-back via endpoint Django**. Se il triage diventa troppo sofisticato, si "gradua" verso un servizio Python senza toccare il resto.

### Flusso
```
Django (TICKET_CREATED / nuovo messaggio client)
   └─► webhook ──► n8n workflow
                     1. GitHub node: cerca file rilevanti nel repo del Project
                     2. IF: info sufficienti?
                        • no & domande < 3 → OpenAI: genera domanda → POST /api/.../messages → STOP
                        • sì / 3 domande   → OpenAI: genera brief
                     3. write-back: PATCH ticket (severity, estimated_hours, ai_solution, operator_id)
                     4. Telegram node: notifica (anche su transizione → Done)
```

### Opzioni considerate

#### Opzione A — n8n come orchestratore ✅ raccomandata (MVP)
| Dimensione | Valutazione |
|---|---|
| Complessità | Bassa-media (visuale, nodi pronti) |
| Costo | Basso (self-host) / medio (n8n Cloud) |
| Time-to-market | **Alto** (triage prototipabile in ore) |
| Familiarità team | Media-alta (no boilerplate worker Python) |
| Testabilità/versioning | Media (inferiore al codice) |

**Pro:** nodi nativi GitHub/OpenAI/Postgres/Telegram → poca glue code; coda, retry ed error-workflow inclusi; workflow **visuale** modificabile senza redeploy (ottimo per iterare in demo); toglie al dev il pezzo più ostico (configurare un task queue); disaccoppia l'AI da Django.
**Contro:** il **loop stateful delle 3 domande** è meno naturale (vedi mitigazione); logica di prompt/context complessa scomoda nei nodi (serve Code node); un **servizio in più** da hostare/monitorare; testing/versioning meno rigorosi del codice.

#### Opzione B — Worker Python (Celery / RQ / django-q2)
| Dimensione | Valutazione |
|---|---|
| Complessità | Media-alta (setup broker/worker) |
| Costo | Basso |
| Time-to-market | Medio-basso |
| Familiarità team | Bassa (Django base) |
| Testabilità/versioning | **Alta** (codice puro, unit test) |

**Pro:** controllo totale su prompt/context (RAG, indicizzazione, multi-agent); tutto in un linguaggio (Python) e in un repo; testabile e versionabile come codice; nessun servizio aggiuntivo oltre al broker.
**Contro:** più boilerplate (broker Redis + worker + serializzazione job); più lento da mettere in piedi; meno "visibile" da modificare al volo in demo; è proprio la parte di infra che pesa di più su un dev Django principiante.

### Trade-off analysis
Si gioca tra **velocità di prototipazione (n8n)** e **controllo/testabilità (worker Python)**. Per un MVP in 4 settimane in cui il triage "deve funzionare in demo" e va iterato spesso, n8n abbatte il time-to-market e rimuove l'infra che ti costerebbe di più. Il rischio principale (loop 3 domande stateful e logica AI raffinata) è mitigabile e, soprattutto, **reversibile**: il contratto webhook-in/write-back-out non cambia, quindi la migrazione a un servizio Python è incrementale.

> **Quando preferire B:** se fin da subito il triage richiede RAG/indicizzazione profonda del codebase o orchestrazione multi-agent con test rigorosi; o se non vuoi un servizio extra da gestire.

### Mitigazioni (vincolanti per A)
1. **Loop 3 domande → re-trigger per messaggio (consigliato):** a ogni risposta del cliente, Django ri-chiama il webhook; n8n rilegge conversazione e contatore domande **dal DB** e decide se chiedere ancora o chiudere. Lo **stato vive nel DB**, non in n8n (no esecuzioni "appese"). Alternativa: `Wait` node con resume via webhook (più fragile per attese lunghe).
2. **Write-back via endpoint Django, non scrittura diretta su Postgres:** mantiene validazione e sicurezza field-level in un solo punto.
3. **Logica AI pesante nei Code node** (JS/Python) o esposta come endpoint Django che n8n chiama.
4. **Quota/PLAN e BYOK** verificati da Django *prima* di invocare n8n (o da n8n leggendo il piano), per non spendere token oltre soglia.

### Consequences
- **Facile:** triage + notifiche operativi rapidamente; iterazione visuale; meno infra worker.
- **Da presidiare:** un servizio n8n da hostare/monitorare; disciplina sullo stato della conversazione nel DB; il write-back deve passare per l'API.
- **Da rivedere quando cresce:** se prompt/context si fanno complessi o serve testabilità forte → portare il triage in un servizio Python, riusando lo stesso contratto webhook/write-back.

### Action items
1. [ ] Esporre webhook/endpoint Django: `triage trigger` (su create/nuovo messaggio) + `PATCH ticket` per il write-back.
2. [ ] Workflow n8n: GitHub → IF(info/contatore) → OpenAI → write-back → Telegram.
3. [ ] Implementare il re-trigger per messaggio leggendo contatore domande dal DB.
4. [ ] Gestire BYOK→master key e check quota PLAN prima dell'invocazione LLM.
5. [ ] Error-workflow n8n (retry + alert) per fallimenti GitHub/OpenAI.

---

## 6. Stima MVP (3-4 settimane) — sequenza consigliata

| Settimana | Obiettivo | Output verificabile |
|---|---|---|
| **1** | Fondamenta backend | API Ninja tickets/messages + auth JWT + Django Admin operativo per tenant/utenti/progetti. Connessione Supabase corretta (porta 5432 migration). |
| **2** | Triage AI (il cuore) | Orchestrazione triage via **n8n** (ADR-003): GitHub + OpenAI, regola 3 domande (re-trigger per messaggio), write-back via API Django; il triage gira davvero su un repo reale e popola severity/hours/solution/operator. *(Fallback: worker Python.)* |
| **3** | Frontend | Client Portal (chat) + Operator Dashboard (Kanban) in Nuxt; Realtime sui messaggi; field-level security verificata (il client NON riceve i campi tecnici). |
| **4** | Rifinitura demo | Notifica Telegram a `Done`, seed dati demo, hardening sicurezza, deploy (backend su Render/Railway/Fly, frontend su Vercel/Netlify, DB su Supabase). |

**Rischio #1**: il triage AI (settimana 2). È il pezzo che "deve funzionare in demo" ed è il più incerto. Mitigazione: iniziare il prototipo del workflow di triage **in parallelo** già in settimana 1 (con n8n bastano poche ore per un primo flusso GitHub→OpenAI→write-back), prima di integrarlo col re-trigger e la regola 3 domande.

---

## 7. TL;DR

- **Backend: sì a Django + Django Ninja.** I modelli sono già fatti, Django Admin ti dà il pannello SaaS gratis, e il triage AI vive meglio in Python. Con l'AI a fianco il gap "Django principiante" è gestibile.
- **Node/Fastify/Nest: no, non ora.** Pivot costoso senza vantaggi entro 4 settimane e non sfrutta il tuo skill forte.
- **Nuxt 4 full-stack: ottimo piano B.** È la scelta più veloce *per le tue mani* (sei senior) e usa Supabase a pieno. Lo sceglierei solo se i modelli Django fossero da rifare o se volessi restare 100% TypeScript.
- **Supabase: sì, ma deliberato.** Tienilo come Postgres gestito + Realtime per la chat. Non duplicare Auth/RLS con Django. Attento al pooler (`:6543`) per le migration.
- **Triage: sì a n8n per l'MVP (ADR-003).** Orchestratore visuale con nodi GitHub/OpenAI/Telegram pronti: triage funzionante in ore, niente boilerplate di worker. Django resta thin (webhook in → write-back via API). Reversibile verso un worker Python se la logica AI si complica.
- **Vincolo trasversale:** il triage è asincrono in qualsiasi scenario → coda/workflow fin da subito (n8n o worker).
