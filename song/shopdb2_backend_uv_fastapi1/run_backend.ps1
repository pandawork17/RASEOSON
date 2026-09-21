$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendHost = "127.0.0.1"
$backendPort = 8000

Push-Location $scriptRoot
try {
$pythonCandidates = @(
    "C:\Users\PC\.pyenv\pyenv-win\versions\3.12.4\python.exe",
    "C:\Users\PC\.pyenv\pyenv-win\versions\3.11.7\python.exe",
    "python"
)

$python = $null
foreach ($candidate in $pythonCandidates) {
    if ($candidate -eq "python") {
        try {
            & $candidate --version *> $null
            $python = $candidate
            break
        } catch {
        }
    } elseif (Test-Path $candidate) {
        $python = $candidate
        break
    }
}

if (-not $python) {
    Write-Error "Python executable not found. Update run_backend.ps1 with a valid Python path."
    exit 1
}

$projectPython = ".venv\Scripts\python.exe"
$pythonToUse = $python

if (Test-Path $projectPython) {
    try {
        & $projectPython --version *> $null
        if ($LASTEXITCODE -eq 0) {
            $pythonToUse = $projectPython
        }
    } catch {
        Write-Warning "Project .venv is blocked by Windows application control policy. Falling back to the trusted pyenv Python."
    }
}

& $pythonToUse -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to upgrade pip."
    exit $LASTEXITCODE
}

& $pythonToUse -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install backend dependencies."
    exit $LASTEXITCODE
}

Write-Host "Backend URL : http://$backendHost`:$backendPort"
Write-Host "Swagger docs: http://$backendHost`:$backendPort/docs"

& $pythonToUse -m uvicorn app.main:app --host $backendHost --port $backendPort --reload
}
finally {
    Pop-Location
}
