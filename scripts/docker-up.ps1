$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

if (-not (Test-Path ".env")) {
  & (Join-Path $PSScriptRoot "generate-env.ps1")
}

docker compose up --build -d
docker compose ps

Write-Host ""
Write-Host "Open: http://localhost:5173"
Write-Host "For other computers, use: http://<this-computer-ip>:5173"

