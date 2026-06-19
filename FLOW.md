# Project Workflow & Entity Relationships

## 1. Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o{ PROJECT_MEMBER : "is member of"
    PROJECT ||--o{ PROJECT_MEMBER : "has members"
    PROJECT ||--o{ TICKET : "contains"
    USER ||--o{ TICKET : "reports (client)"
    USER ||--o{ TICKET : "handles (operator)"
    TICKET ||--o{ MESSAGE : "has conversation"
    USER ||--o{ MESSAGE : "sends"

    USER {
        uuid id
        string email
        enum role "client | operator"
    }

    PROJECT {
        uuid id
        string name
        string description
    }

    PROJECT_MEMBER {
        uuid id
        uuid project_id
        uuid user_id
        string role_in_project
    }

    TICKET {
        uuid id
        uuid project_id
        uuid client_id
        uuid operator_id
        enum status "Todo | In Progress | In Review | Done"
        enum severity "Critical | High | Medium | Low"
        int estimated_hours
        text ai_solution
    }

    MESSAGE {
        uuid id
        uuid ticket_id
        uuid sender_id
        text content
        timestamp created_at
    }
```

## 2. Logic Flow Chart (The Triage Process)

```mermaid
graph TD
    A[Client: Reports Bug] --> B{AI Agent}
    B --> C[LLM: Fetch Codebase via GitHub API]
    C --> D{Is info sufficient?}
    D -- No --> E[AI: Ask Clarification Questions to Client]
    E --> B
    D -- Yes --> F[AI: Analyze Severity & Solution]
    F --> G[AI: Assign to Operator by Role]
    G --> H[Operator: Receives Ticket + AI Brief]
    H --> I[State: Todo]
    I --> J[State: In Progress]
    J --> K[State: In Review]
    K --> L[State: Done]
    L --> M[Client: Notified of Resolution]
```

## 3. Data Access Matrix (Security Layers)

| Entity | Client View | Operator View | AI Agent View |
| :--- | :---: | :---: | :---: |
| **Ticket Status** | ✅ (Simplified) | ✅ (Full) | ✅ (Update) |
| **Severity** | ❌ | ✅ | ✅ (Set) |
| **Estimated Time** | ❌ | ✅ | ✅ (Set) |
| **AI Solution Brief** | ❌ | ✅ | ✅ (Generate) |
| **Codebase Access** | ❌ | ✅ | ✅ (Via API) |
| **Project Members** | ❌ | ✅ | ❌ |

## 4. Key Interaction Sequences

### The "AI Triage" Loop
1. **Trigger**: `TICKET_CREATED` event.
2. **Action**: LLM reads ticket description $\rightarrow$ Searches GitHub for matching patterns.
3. **Decision**: If the bug is ambiguous, LLM triggers a `MESSAGE_SENT` to client.
4. **Resolution**: Once clarity is reached, LLM updates `TICKET` with metadata and sets `operator_id`.

### The "Resolution" Loop
1. **Trigger**: Operator updates status to `Done`.
2. **Action**: System triggers notification service.
3. **Outcome**: Client receives a final message in the chat card informing them that the bug is fixed.
