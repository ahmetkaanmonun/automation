$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

if (-not (Test-Path ".env.production")) {
  & (Join-Path $PSScriptRoot "generate-prod-env.ps1")
}

if (-not (Test-Path "certs\fullchain.pem") -or -not (Test-Path "certs\privkey.pem")) {
  Write-Host "Missing certs\fullchain.pem or certs\privkey.pem."
  Write-Host "Place your company/VPN certificate files there before starting HTTPS production."
  exit 1
}

docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
docker compose --env-file .env.production -f docker-compose.prod.yml ps

