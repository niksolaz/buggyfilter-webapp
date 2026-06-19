# Implementation Log: BuggyFilter ServerApp

## Goal
Build a robust backend that acts as an AI-driven intermediary between clients and operators, focusing on automated bug triage via GitHub codebase analysis and LLM reasoning.

## Architecture Stack
- **Framework**: Nest.js (Node.js, TypeScript)
- **Database**: PostgreSQL (Supabase)
- **Integrations**: 
  - GitHub API (Octokit)
  - LLM (via OpenAI/Anthropic API)
- **Auth**: JWT with RBAC (Client vs Operator)

---

## Roadmap & Milestones

### Phase 1: The Triage Engine (Current)
*Focus: Validating the core value proposition — can the AI actually triage bugs based on code?*

- [x] **Task 1.1: Environment Setup**
  - Setup `.env` for GitHub and LLM keys.
  - Install core dependencies (`octokit`, `openai` or similar).
- [x] **Task 1.2: GitHub Integration Service**
  - Implement logic to search and retrieve relevant code snippets from a repository.
- [x] **Task 1.3: LLM Triage Logic**
  - Design prompts for severity estimation, time estimation, and solution pointers.
  - Implement a service to unify GitHub context + Bug report $\rightarrow$ Triage Brief.
- [x] **Task 1.4: Triage API Endpoint**
  - Create a basic endpoint to test the full flow manually.

### Phase 2: Data Persistence & Infrastructure
- [ ] **Task 2.1: Supabase Schema Implementation**
  - Create `users`, `projects`, `tickets`, and `messages` tables.
- [ ] **Task 2.2: Ticket Lifecycle Management**
  - Implement state transitions (`Todo` $\rightarrow$ `In Progress` $\rightarrow$ `Done`).

### Phase 3: Auth & Access Control
- [ ] **Task 3.1: JWT Implementation**
- [ ] **Task 3.2: Role-Based Access Control (RBAC)**
  - Ensure clients cannot access internal triage metrics.

### Phase 4: Real-time & Communication
- [ ] **Task 4.1: WebSocket Integration** (for real-time chat with AI/Operator).
- [ ] **Task 4.2: Notification System**.

---

## Technical Decisions & Log
- **Date: 2026-06-19**
  - Decision: Adopt a "Backend-First" strategy to prioritize the AI Triage Engine.
  - Decision: Created `IMPLEMENTATION.md` to track granular progress.
