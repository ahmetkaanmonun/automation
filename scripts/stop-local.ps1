$ErrorActionPreference = "Continue"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$pgCtl = Join-Path $root "tools\postgresql-17.9\pgsql\bin\pg_ctl.exe"
$pgData = Join-Path $root "runtime\postgres-data"
$logs = Join-Path $root "logs"

foreach ($pidFile in @("api.pid", "web.pid")) {
  $path = Join-Path $logs $pidFile
  if (Test-Path $path) {
    $processId = Get-Content $path
    Stop-Process -Id $processId -Force
    Remove-Item $path -Force
  }
}

if (Test-Path $pgCtl) {
  & $pgCtl -D $pgData stop
}

Write-Host "Local QA platform processes stopped."

