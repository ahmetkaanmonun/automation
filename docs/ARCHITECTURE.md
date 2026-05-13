# System Architecture

## High-Level Design

```mermaid
flowchart LR
  QA["QA User"] --> WEB["React + MUI Web App"]
  WEB --> API["NestJS API"]
  API --> DB[("PostgreSQL")]
  API --> FILES["Local/Object Storage"]
  API --> RUNNER["Execution Queue + Playwright Runner"]
  RUNNER --> TARGET["Application Under Test"]
  RUNNER --> FILES
  RUNNER --> DB
```

## Core Bounded Contexts

- Identity: login, JWT, roles, user management.
- Workspace: projects and modules.
- Automation assets: locators, locator versions, test data, test files.
- Scenario authoring: scenarios, tags, ordered steps.
- Execution: queueing, status lifecycle, schedules, logs, retries, screenshots.
- Reporting: execution reports, exports and dashboard metrics.
- Governance: audit logs and edit locks.

## Frontend Screens

1. Login
2. Dashboard
3. Users and roles
4. Projects
5. Modules
6. Locators
7. Test data
8. Test files
9. Scenario list
10. Scenario builder
11. Execution center
12. Execution detail and logs
13. Scheduled runs
14. Reports
15. Audit log
16. Settings

## Backend Modules

- `AuthModule`
- `UsersModule`
- `ProjectsModule`
- `ModulesModule`
- `LocatorsModule`
- `TestDataModule`
- `TestFilesModule`
- `ScenariosModule`
- `ExecutionsModule`
- `SchedulesModule`
- `DashboardModule`
- `AuditModule`
- `PrismaModule`

## Execution Flow

```mermaid
sequenceDiagram
  participant U as QA User
  participant W as Web
  participant A as API
  participant Q as Queue
  participant P as Playwright Runner
  participant D as PostgreSQL

  U->>W: Start scenario execution
  W->>A: POST /executions
  A->>D: Create execution Pending
  A->>Q: Enqueue execution
  A-->>W: executionId
  Q->>P: Pick job
  P->>D: Running + step logs
  P->>P: Execute Playwright actions
  P->>D: Passed/Failed report
  W->>A: Poll /executions/:id
  A-->>W: live status and logs
```

## Scheduled Execution Flow

```mermaid
sequenceDiagram
  participant U as QA User
  participant W as Web
  participant A as API
  participant S as Scheduler
  participant Q as Execution Queue
  participant P as Playwright Runner
  participant D as PostgreSQL

  U->>W: Create schedule
  W->>A: POST /schedules
  A->>D: Save nextRunAt
  S->>D: Find due schedules
  S->>Q: Start execution
  Q->>P: Execute scenario
  P->>D: Logs, screenshot, report
  S->>D: Update lastRunAt and nextRunAt
```

## Best Practices For Production

- Move execution queue to Redis/BullMQ for multi-node scaling.
- Store files and screenshots in S3/MinIO instead of local disk.
- Add LDAP/SSO and short-lived JWT refresh strategy.
- Add optimistic locking for scenario and locator edits.
- Run Playwright workers in isolated containers.
- Add environment-level secrets management through Vault/KMS.
- Capture OpenTelemetry traces and structured logs.
- Enforce audit trails for every write action.
- Add RBAC tests and migration tests in CI.
- Back up PostgreSQL and uploaded assets.
