$env:Path = "C:\Program Files\nodejs;" + [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   🚀 Starting Agentra Multi-Agent Platform             " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Demo:     operator@agentra.ai / Operator123!" -ForegroundColor Yellow
Write-Host ""
node run-dev.js
