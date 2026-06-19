# Project Specifications: BuggyFilter WebApp

## 1. Overview
BuggyFilter is an AI-augmented bug tracking system designed to bridge the gap between end-users (clients) and technical operators. The core innovation is an LLM-driven intermediary that triages tickets by analyzing the codebase, interviewing the client, and providing operators with a pre-analyzed technical brief.

## 2. Core Workflow
1. **Reporting**: Client reports a bug via a chat-like interface.
2. **AI Triage (The Intermediary)**:
   - The LLM uses a GitHub API key to access the codebase.
   - The AI engages the client in a conversation to gather missing details.
   - The AI analyzes the reported issue against the code to determine:
     - **Severity**: Critical, High, Medium, Low.
     - **Estimated Resolution Time**: In hours.
     - **Possible Solution**: A technical suggestion/pointer to specific files/lines.
     - **Target Operator**: Based on role (e.g., Frontend, Backend, DevOps).
3. **Operator Assignment**: The ticket is pushed to the operator's dashboard with all AI-generated metadata.
4. **Resolution Lifecycle**: The operator moves the ticket through states: `Todo` $\rightarrow$ `In Progress` $\rightarrow$ `In Review` $\rightarrow$ `Done`.
5. **Closing**: Upon reaching `Done`, the system notifies the client with a resolution message.

## 3. Entity Relationships & Roles

### Entities
- **Client**: Can create tickets and chat with the AI. Has no visibility into internal technical metrics.
- **Operator**: Technical staff. Sees the full technical brief (severity, estimated time, solution).
- **AI Agent**: The logic layer utilizing LLM + GitHub API.
- **Ticket**: The central object containing:
  - Client ID, Operator ID.
  - Status (Enum: Todo, In Progress, In Review, Done).
  - Severity (Enum: Critical, High, Medium, Low).
  - Estimated Time (Hours).
  - AI Technical Analysis (Markdown).
  - Chat History.

### Workflow Design (Logic Flow)
`Client` $\xrightarrow{\text{Bug Report}}$ `AI Agent` $\xleftarrow{\text{Code Analysis}}$ `GitHub Repository`
$\downarrow$
`AI Agent` $\xrightarrow{\text{Clarification Questions}}$ `Client`
$\downarrow$
`AI Agent` $\xrightarrow{\text{Triage (Role, Severity, Time, Solution)}}$ `Operator`
$\downarrow$
`Operator` $\xrightarrow{\text{State Transition (Todo $\rightarrow$ Done)}}$ `Ticket`
$\downarrow$
`Ticket (Done)` $\xrightarrow{\text{Notification}}$ `Client`

## 4. Technical Architecture

### Frontend (Vue 3 + Nuxt 4)
- **Client Portal**: Simple, chat-centric UI. No access to administrative dashboards.
- **Operator Dashboard**: Kanban-style board for managing ticket states and reviewing AI briefs.
- **State Management**: Pinia for real-time ticket updates.

### Backend (Node.js, TypeScript, Nest.js)
- **API Layer**: REST/WebSocket for real-time chat and ticket updates.
- **LLM Integration**: Service layer to handle prompts and context injection (including codebase snippets from GitHub).
- **GitHub Integration**: Octokit for repository indexing and searching.
- **Auth**: JWT-based authentication with role-based access control (RBAC).

### Database (PostgreSQL via Supabase)
- **Tables**:
  - `users`: id, email, role (client/operator).
  - `projects`: id, name, description, created_at.
  - `project_members`: id, project_id, user_id, role_in_project (owner/operator/client).
  - `tickets`: id, project_id, client_id, operator_id, status, severity, estimated_hours, ai_solution, created_at, updated_at.
  - `messages`: id, ticket_id, sender_id (client/ai/operator), content, timestamp.

### DevOps
- **CI/CD**: GitHub Actions for automated testing and deployment.
- **Containerization**: Docker for consistent environment across development and production.
- **Monitoring**: Health checks for LLM API availability and GitHub rate limits.

## 5. Security & Constraints
- **Data Isolation**: Clients must never have access to the `severity`, `estimated_hours`, or `ai_solution` fields via API.
- **API Key Management**: GitHub and LLM keys must be stored in environment variables (Secrets), never exposed to the frontend.
- **Rate Limiting**: Implement limits on AI interactions to prevent API cost spikes.
