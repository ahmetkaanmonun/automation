# Product Roadmap

This platform is ready to run as an internal QA automation workspace for a small team. The items below are the next improvements that would make it stronger for long-running company usage.

## Ready Now

- Shared login-based QA workspace.
- Project, module, locator, test data, file and scenario management.
- Step builder with reusable locators, test data and uploaded files.
- Playwright-based scenario execution.
- Execution logs, failure screenshots and reports.
- Scheduled scenario runs for recurring smoke/regression checks.
- Docker-based intranet deployment and private web deployment notes.

## Recommended Next

- Move execution scheduling and queueing to Redis/BullMQ.
- Run Playwright jobs in isolated worker containers.
- Add browser video, trace viewer and richer step-level artifacts.
- Add SSO/LDAP or company identity provider integration.
- Add optimistic locking/version compare screens for scenarios and locators.
- Add email, Teams or Slack notifications for failed scheduled runs.
- Store uploads and screenshots in MinIO or S3-compatible object storage.
- Add database migration discipline for production releases.
- Add nightly backup and retention policies for reports, logs and screenshots.
- Add CI checks for API tests, UI build, Prisma schema validation and Docker build.

## Later Enhancements

- Advanced calendar schedules and blackout windows.
- Test suite grouping and release-based test plans.
- Parameterized scenario runs.
- API test assertions with reusable request templates.
- Visual comparison assertions.
- Tag-based dashboards and flaky-test analytics.
- Multi-run comparison reports.
- Import/export for scenarios, locators and test data.
