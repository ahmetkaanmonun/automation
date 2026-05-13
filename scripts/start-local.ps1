$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$pgBin = Join-Path $root "tools\postgresql-17.9\pgsql\bin"
$pgData = Join-Path $root "runtime\postgres-data"
$logs = Join-Path $root "logs"

New-Item -ItemType Directory -Force -Path $logs | Out-Null

if (-not (Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet)) {
  & (Join-Path $pgBin "pg_ctl.exe") -D $pgData -l (Join-Path $logs "postgres.log") -o "-p 5432" start
}

$env:DATABASE_URL = "postgresql://qa_user:qa_password@localhost:5432/qa_automation?schema=public"
$env:JWT_SECRET = "local-dev-secret-change-me"
$env:ENCRYPTION_KEY = "local-dev-32-char-secret-change-me"
$env:API_PORT = "3000"
$env:UPLOAD_DIR = "uploads"

if (-not (Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet)) {
  $api = Start-Process -FilePath "npm" -ArgumentList @("run", "dev", "--prefix", "apps/api") -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs "api-dev.out.log") -RedirectStandardError (Join-Path $logs "api-dev.err.log") -PassThru
  Set-Content -Path (Join-Path $logs "api.pid") -Value $api.Id
}

if (-not (Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet)) {
  $web = Start-Process -FilePath "npm" -ArgumentList @("run", "dev", "--prefix", "apps/web") -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs "web-dev.out.log") -RedirectStandardError (Join-Path $logs "web-dev.err.log") -PassThru
  Set-Content -Path (Join-Path $logs "web.pid") -Value $web.Id
}

Write-Host "Web: http://localhost:5173"
Write-Host "API: http://localhost:3000/api"

