$ErrorActionPreference = "Stop"

$taskName = "CivicOS-City-Surveillance-Pipeline"
$batPath = "D:\ML\AI-Based City Surveillance\start_pipeline.bat"

if (-not (Test-Path $batPath)) {
    throw "Missing startup script: $batPath"
}

$action = New-ScheduledTaskAction -Execute "cmd.exe" `
    -Argument "/c `"$batPath`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable `
    -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask -TaskName $taskName -Action $action `
    -Trigger $trigger -Settings $settings -Force | Out-Null

Write-Host "Created scheduled task: $taskName"
Write-Host "It starts after login and restarts the pipeline task when Windows is available."
