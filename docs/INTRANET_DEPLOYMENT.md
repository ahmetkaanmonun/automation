# Intranet Deployment Guide

This guide prepares the QA Automation Platform for use by a small internal QA team on a company computer or VM.

## Recommended Runtime

- Windows 10/11 Pro or Windows Server
- Docker Desktop with WSL2 enabled
- 8 GB RAM minimum, 16 GB recommended
- Static IP or reserved DHCP address
- Firewall access for the web port, default `5173`

## First Install

Clone the repository on the host machine:

```powershell
git clone <your-repo-url>
cd automation
```

Create `.env`:

```powershell
.\scripts\generate-env.ps1
notepad .env
```

Edit these values before first use:

```env
ADMIN_EMAIL=admin@company.local
ADMIN_PASSWORD=ChangeMe123!
CORS_ORIGIN=http://localhost:5173,http://<host-ip>:5173
WEB_PORT=5173
```

Start:

```powershell
.\scripts\docker-up.ps1
```

Open from the host:

```text
http://localhost:5173
```

Open from another company computer:

```text
http://<host-ip>:5173
```

## Network And Firewall

Expose only the web port to the local network:

- `5173/tcp`: Web UI

The API and PostgreSQL are bound to host localhost by Docker Compose:

- API: `127.0.0.1:3000`
- PostgreSQL: `127.0.0.1:5432`

Browser traffic goes to the web app, and Nginx proxies `/api` and `/uploads` internally to the API container.

## Admin Password

The seed script creates the first admin account. It does not reset the password on every restart unless:

```env
RESET_ADMIN_PASSWORD=true
```

After using that once, set it back to:

```env
RESET_ADMIN_PASSWORD=false
```

## Backups

Create a database backup:

```powershell
.\scripts\backup-postgres.ps1
```

Also back up Docker volumes:

- `postgres_data`
- `api_uploads`

Screenshots and uploaded test files live in the `api_uploads` volume.

## Updates

Pull the latest code:

```powershell
git pull
docker compose up --build -d
```

Check status:

```powershell
docker compose ps
docker compose logs -f api
```

## Security Checklist

- Change `POSTGRES_PASSWORD`, `JWT_SECRET`, `ENCRYPTION_KEY`, and `ADMIN_PASSWORD`.
- Keep `.env` out of Git.
- Do not expose PostgreSQL to the LAN.
- Use a dedicated Windows/VM account for hosting.
- Back up database and upload volumes regularly.
- Prefer VPN or intranet-only access.
- For production hardening, add SSO/LDAP, HTTPS reverse proxy, Redis queue, and object storage.

