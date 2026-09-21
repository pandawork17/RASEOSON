$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendHost = "127.0.0.1"
$frontendPort = 4173

Push-Location $scriptRoot
try {
    $npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if (-not $npmCommand) {
        Write-Error "npm.cmd not found. Install Node.js first."
        exit 1
    }

    if (-not (Test-Path "node_modules")) {
        & $npmCommand.Source install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install frontend dependencies."
            exit $LASTEXITCODE
        }
    }

    Write-Host "Frontend URL: http://$frontendHost`:$frontendPort"
    Write-Host "Backend API  : http://127.0.0.1:8000"

    & $npmCommand.Source run dev
}
finally {
    Pop-Location
}
