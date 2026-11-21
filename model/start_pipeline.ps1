$ErrorActionPreference = "Stop"

$aiRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$civicRoot = Join-Path (Split-Path -Parent $aiRoot) "CivicOS"
$envFile = Join-Path $civicRoot ".env.local"

if (-not (Test-Path $envFile)) {
    throw "Missing CivicOS environment file: $envFile"
}

foreach ($line in Get-Content $envFile) {
    if ($line -match '^\s*(?:#|$)') {
        continue
    }
    $separator = $line.IndexOf("=")
    if ($separator -lt 1) {
        continue
    }
    $name = $line.Substring(0, $separator).Trim()
    $value = $line.Substring($separator + 1).Trim()
    [Environment]::SetEnvironmentVariable($name, $value, "Process")
}

$detector = Start-Process -FilePath "python" -ArgumentList @(
    "-m", "uvicorn", "ai_service:app",
    "--host", "127.0.0.1",
    "--port", "8001"
) -WorkingDirectory $aiRoot -PassThru

$deadline = (Get-Date).AddSeconds(30)
do {
    Start-Sleep -Milliseconds 500
    try {
        $health = Invoke-RestMethod "http://127.0.0.1:8001/health"
    } catch {
        $health = $null
    }
} while (-not $health -and (Get-Date) -lt $deadline)

if (-not $health) {
    throw "YOLO detection service did not become healthy."
}

$civicos = Start-Process -FilePath "npm" -ArgumentList "run", "dev" `
    -WorkingDirectory $civicRoot -PassThru

$config = Join-Path $aiRoot "camera_config.json"
if (-not (Test-Path $config)) {
    throw "Missing camera_config.json. Copy camera_config.example.json and configure camera sources."
}

$workers = Start-Process -FilePath "python" -ArgumentList @(
    "multi_camera_worker.py", $config
) -WorkingDirectory $aiRoot -PassThru

Write-Host "CivicOS pipeline started."
Write-Host "Web: http://localhost:3000"
Write-Host "Detector: http://127.0.0.1:8001/health"
Write-Host "Camera workers: running"
Write-Host "Press Enter to stop all pipeline processes."
[Console]::ReadLine() | Out-Null

foreach ($process in @($workers, $civicos, $detector)) {
    if ($null -ne $process -and -not $process.HasExited) {
        Stop-Process -Id $process.Id -Force
    }
}
