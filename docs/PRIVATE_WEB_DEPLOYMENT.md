# Private Web Deployment

This is the recommended deployment model when the QA platform should be used from browsers but must not be exposed as a public internet app.

## Target Architecture

```text
QA users
  -> VPN / company LAN / firewall allowlist
  -> https://qa-platform.company.com
  -> Nginx reverse proxy
  -> React web container
  -> NestJS API container
  -> PostgreSQL container
  -> Playwright runner inside API container
```

Only ports `80` and `443` are exposed by the production compose file. PostgreSQL and API are internal Docker services.

## Files

- `docker-compose.prod.yml`: production private-web compose.
- `.env.production.example`: production environment template.
- `deploy/nginx/templates/qa-platform.conf.template`: HTTPS reverse proxy config.
- `certs/fullchain.pem`: your company/domain certificate chain.
- `certs/privkey.pem`: your private key. Never commit this file.
- `scripts/prod-up.ps1`: start production stack.
- `scripts/prod-down.ps1`: stop production stack.
- `scripts/prod-backup-postgres.ps1`: database backup.

## First-Time Setup

On the server or company host:

```powershell
git clone <repo-url>
cd automation
.\scripts\generate-prod-env.ps1
notepad .env.production
```

Edit:

```env
SERVER_NAME=qa-platform.company.com
PUBLIC_ORIGIN=https://qa-platform.company.com
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=<temporary-strong-password>
```

Place certificate files:

```text
certs/fullchain.pem
certs/privkey.pem
```

Start:

```powershell
.\scripts\prod-up.ps1
```

Open:

```text
https://qa-platform.company.com
```

## Certificate Options

Use one of these:

- Company internal CA certificate.
- A public certificate if the domain is reachable for certificate issuance.
- A VPN-only domain certificate managed by infrastructure.

For a first private pilot, a self-signed certificate works technically but users will see browser warnings unless the CA is trusted by company devices.

## Firewall

Allow from VPN/company LAN only:

- `443/tcp`
- optionally `80/tcp` for redirect to HTTPS

Do not expose:

- PostgreSQL
- API direct port
- Docker daemon

## Admin Password Reset

The seed script creates or updates the admin account. It does not reset the password on every restart.

To reset once:

```env
RESET_ADMIN_PASSWORD=true
ADMIN_PASSWORD=<new-temp-password>
```

Run:

```powershell
.\scripts\prod-up.ps1
```

After login, set:

```env
RESET_ADMIN_PASSWORD=false
```

## Backup

```powershell
.\scripts\prod-backup-postgres.ps1
```

Also back up Docker volumes:

- `automation_postgres_data`
- `automation_api_uploads`

The upload volume contains test files and failure screenshots.

## Update

```powershell
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

Check logs:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api
```

## Security Notes

- Keep `.env.production` and `certs/*.pem` out of Git.
- Put the host behind VPN, private subnet, or firewall allowlist.
- Use long random `JWT_SECRET` and `ENCRYPTION_KEY`.
- Rotate the first admin password after setup.
- Prefer SSO/LDAP before opening access beyond the QA team.
- Review uploaded files and screenshots as sensitive data.

