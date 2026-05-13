$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

$backupDir = Join-Path $root "backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$file = "qa_automation-prod-$timestamp.sql"
$path = Join-Path $backupDir $file

docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres pg_dump -U qa_user qa_automation | Set-Content -Path $path -Encoding UTF8

Write-Host "Backup created: $path"

