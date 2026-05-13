$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$target = Join-Path $root ".env.production"

if (Test-Path $target) {
  Write-Host ".env.production already exists: $target"
  exit 0
}

function New-Secret {
  param([int] $Bytes = 32)
  $buffer = New-Object byte[] $Bytes
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($buffer)
  [Convert]::ToBase64String($buffer)
}

$postgresPassword = New-Secret 24
$jwtSecret = New-Secret 48
$encryptionKey = New-Secret 48

@"
POSTGRES_DB=qa_automation
POSTGRES_USER=qa_user
POSTGRES_PASSWORD=$postgresPassword
DATABASE_URL=postgresql://qa_user:$postgresPassword@postgres:5432/qa_automation?schema=public

JWT_SECRET=$jwtSecret
ENCRYPTION_KEY=$encryptionKey

SERVER_NAME=qa-platform.company.com
PUBLIC_ORIGIN=https://qa-platform.company.com
HTTP_PORT=80
HTTPS_PORT=443

ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=ChangeMe123!
ADMIN_FULL_NAME=QA Platform Admin
RESET_ADMIN_PASSWORD=false
SEED_DEMO_DATA=false
"@ | Set-Content -Path $target -Encoding UTF8

Write-Host "Created $target"
Write-Host "Edit SERVER_NAME, PUBLIC_ORIGIN, ADMIN_EMAIL and ADMIN_PASSWORD before first production start."

