# Backend API Design

Base URL: `/api`

## Auth

- `POST /auth/login`
- `GET /auth/me`

## Users

- `GET /users`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`

## Projects And Modules

- `GET /projects`
- `POST /projects`
- `PATCH /projects/:id`
- `DELETE /projects/:id`
- `GET /modules?projectId=...`
- `POST /modules`
- `PATCH /modules/:id`
- `DELETE /modules/:id`

## Locators

- `GET /locators?projectId=&moduleId=&q=&active=`
- `POST /locators`
- `GET /locators/:id`
- `PATCH /locators/:id`
- `DELETE /locators/:id`
- `GET /locators/:id/versions`

## Test Data

- `GET /test-data?projectId=&moduleId=&environment=`
- `POST /test-data`
- `PATCH /test-data/:id`
- `DELETE /test-data/:id`

Secret values are encrypted at rest and returned as masked values unless a dedicated privileged endpoint is added later for runner-only resolution.

## Files

- `GET /test-files?projectId=&moduleId=&scenarioId=`
- `POST /test-files/upload`
- `GET /test-files/:id/download`
- `DELETE /test-files/:id`

## Scenarios

- `GET /scenarios?projectId=&moduleId=&environment=&tag=`
- `POST /scenarios`
- `GET /scenarios/:id`
- `PATCH /scenarios/:id`
- `POST /scenarios/:id/clone`
- `DELETE /scenarios/:id`

## Executions

- `POST /executions`
- `GET /executions`
- `GET /executions/:id`
- `GET /executions/:id/logs`
- `POST /executions/:id/retry`

## Schedules

- `GET /schedules`
- `POST /schedules`
- `PATCH /schedules/:id`
- `DELETE /schedules/:id`

Schedules can run a scenario on an interval or once per day. They create normal execution records, so logs, screenshots and reports stay in the same reporting flow.

## Dashboard And Reports

- `GET /dashboard/summary`
- `GET /reports/executions?from=&to=&status=&moduleId=`
- `GET /reports/executions/:id/export?format=pdf|xlsx|html`
