# Requested Outputs

## 1. System Architecture

The platform is split into React web, NestJS API, PostgreSQL, file storage and a Playwright runner. The detailed architecture and execution sequence are in `docs/ARCHITECTURE.md`.

## 2. Frontend Screen List

- Login
- Dashboard
- Users and roles
- Projects and modules
- Locator management
- Test data management
- Test file management
- Scenario list
- Scenario builder
- Execution center
- Execution detail/logs
- Scheduled runs
- Reports
- Audit logs
- Settings

## 3. Backend API Design

The endpoint catalog is in `docs/API.md`. The starter implements auth, users, projects, modules, locators, test data, test files, scenarios, executions, schedules, reports and dashboard routes.

## 4. Database ER Diagram

The ER diagram is in `docs/ER_DIAGRAM.md`. The executable schema is `apps/api/prisma/schema.prisma`.

## 5. Folder Structure

```text
.
├── apps
│   ├── api
│   │   ├── prisma
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src
│   │       ├── auth
│   │       ├── common
│   │       ├── dashboard
│   │       ├── executions
│   │       ├── locators
│   │       ├── modules
│   │       ├── prisma
│   │       ├── projects
│   │       ├── scenarios
│   │       ├── test-data
│   │       ├── test-files
│   │       └── users
│   └── web
│       └── src
│           ├── api
│           ├── layout
│           ├── pages
│           └── state
├── docs
├── docker-compose.yml
└── README.md
```

## 6. MVP Development Plan

The phased implementation plan is in `docs/MVP_PLAN.md`.

## 7. Example UI Screens

The starter React app includes working first-pass screens:

- `LoginPage`: JWT login.
- `DashboardPage`: scenario/locator counts, pass/fail rates, recent executions and module status.
- `ProjectsPage`: project overview and create action.
- `LocatorsPage`: locator search/filter list.
- `TestDataPage`: environment data list with masked secrets.
- `ScenarioBuilderPage`: scenario cards, clone and run actions.
- `ExecutionsPage`: live polling execution center.
- `SchedulesPage`: recurring scenario run management.

## 8. Example Database Schemas

The Prisma schema includes normalized models for users, projects, modules, locators, locator versions, test data, test files, scenarios, steps, executions, execution logs, reports, scheduled runs and audit logs.

## 9. Working Starter Project

Run:

```bash
cp .env.example .env
docker compose up --build
```

Default login:

- `admin@local.test`
- `Admin123!`

## 10. Docker Local Setup

`docker-compose.yml` starts:

- PostgreSQL on `5432`
- API on `3000`
- Web on `5173`

## 11. Example Test Scenario Flow

1. Admin logs in.
2. A project and module are created.
3. Reusable locators are added under the module.
4. Environment-based test data is created.
5. A scenario is built with ordered steps.
6. Tester clicks Run.
7. Optionally, a schedule is created for recurring smoke/regression checks.
8. Execution enters Pending, then Running.
9. Step logs are written.
10. Execution ends as Passed or Failed.
11. Dashboard and reports reflect the result.

## 12. Playwright/Selenium Integration

The starter includes `PlaywrightRunnerService`, which maps platform step actions to Playwright actions. Selenium can be added later as a second runner adapter behind the same execution service contract.

## 13. Example Execution Flow

- `POST /api/executions` creates a `PENDING` execution.
- In-process queue starts up to two concurrent jobs.
- Runner loads the scenario steps with locator references.
- Each step writes `RUNNING`, `PASSED` or `FAILED` logs.
- Final execution status, duration, error message and report row are stored.

## 14. Production-Ready Best Practices

- Use Redis/BullMQ instead of the in-process queue.
- Run Playwright workers in isolated containers.
- Store files/screenshots in MinIO or S3.
- Add SSO/LDAP for intranet identity.
- Add optimistic locking on scenario and locator editing.
- Add centralized logs, OpenTelemetry and alerting.
- Add export workers for PDF, Excel and HTML reports.
- Add CI migration checks and RBAC integration tests.
- Use Vault/KMS for environment secrets.
- Define data retention rules for logs, reports and screenshots.
