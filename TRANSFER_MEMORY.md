# PROJECT TRANSFER MEMORY: BuggyFilter WebApp
## Context for Default Profile

### 1. Project Essence
BuggyFilter is an AI-augmented bug tracking system where an LLM acts as a technical intermediary. The AI triages tickets by analyzing the codebase (GitHub API), interviewing the client, and providing operators with a technical brief (Severity, Estimated Time, Possible Solution) while keeping the client isolated from internal technical metrics.

### 2. Current Implementation State
The project is structured in a dedicated directory: `/Users/niksolaz/Claude/Projects/buggyfilter-webapp/`

#### Directory Structure:
- `/clientapp`: Nuxt 4 / Vue 3 boilerplate (Compatibility version 4, Page-based routing).
- `/serverapp`: Nest.js / TypeScript boilerplate (Port 3000).
- `SPECS.md`: Full technical specifications and DB schema.
- `FLOW.md`: Entity Relationship Diagrams (ERD) and Logic Flow Charts (Mermaid).

### 3. Key Architectural Decisions
- **Multi-Tenancy**: Implemented via `projects` and `project_members` tables, allowing one operator to manage multiple projects/clients.
- **Triage Loop**: Client $\rightarrow$ AI Agent $\rightarrow$ Codebase Analysis $\rightarrow$ Operator Assignment.
- **Resolution Loop**: Operator (Todo $\rightarrow$ Done) $\rightarrow$ Client Notification.
- **Security**: Strict data isolation—clients cannot access severity, estimation, or AI-suggested solutions.

### 4. Database Schema (PostgreSQL/Supabase)
- `users`: id, email, role (client|operator).
- `projects`: id, name, description.
- `project_members`: id, project_id, user_id, role_in_project.
- `tickets`: id, project_id, client_id, operator_id, status (Todo, In Progress, In Review, Done), severity (Critical, High, Medium, Low), estimated_hours, ai_solution.
- `messages`: id, ticket_id, sender_id, content, timestamp.

### 5. Next Immediate Steps
- [ ] Setup Supabase / PostgreSQL database based on `SPECS.md`.
- [ ] Implement Backend API in `serverapp` (Ticket management & GitHub/LLM integration).
- [ ] Develop Frontend UI in `clientapp` (Chat interface for clients, Kanban for operators).
- [ ] Integrate Telegram Bot API for final resolution notifications.

### 6. Reference Files
Always refer to `SPECS.md` and `FLOW.md` in the root folder before making architectural changes.
