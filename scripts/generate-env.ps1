$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$target = Join-Path $root ".env"

if (Test-Path $target) {
  Write-Host ".env already exists: $target"
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
API_PORT=3000
WEB_PORT=5173
UPLOAD_DIR=/app/uploads
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@company.local
ADMIN_PASSWORD=ChangeMe123!
ADMIN_FULL_NAME=QA Platform Admin
RESET_ADMIN_PASSWORD=false
SEED_DEMO_DATA=false
VITE_API_URL=/api
"@ | Set-Content -Path $target -Encoding UTF8

Write-Host "Created $target"
Write-Host "Before production use, edit ADMIN_EMAIL, ADMIN_PASSWORD, CORS_ORIGIN and WEB_PORT if needed."
