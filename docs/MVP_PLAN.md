# MVP Development Plan

## Phase 1: Platform Foundation

- Docker Compose, PostgreSQL, API and web containers.
- Prisma schema and seed data.
- JWT auth, roles and route guards.
- Audit logging for write actions.

## Phase 2: Shared QA Asset Management

- Project and module management.
- Locator CRUD with version history.
- Environment-based test data with encrypted secret values.
- File upload/download with metadata.

## Phase 3: Scenario Builder

- Scenario CRUD, clone and active/passive status.
- Ordered test steps.
- Action catalog support.
- Locator and test data references in steps.

## Phase 4: Execution Center

- Start single scenario execution.
- Execution status lifecycle.
- Playwright action mapping.
- Execution logs, screenshots and retry foundation.

## Phase 5: Reporting And Dashboard

- Summary dashboard.
- Execution detail reports.
- Report filters.
- Export adapters for PDF, Excel and HTML.

## Phase 6: Company Rollout Hardening

- Redis-backed queue and isolated runner containers.
- Edit locks and optimistic concurrency.
- SSO/LDAP.
- Object storage.
- CI/CD, monitoring and backups.

