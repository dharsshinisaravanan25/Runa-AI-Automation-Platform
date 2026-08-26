$env:Path = "C:\Program Files\nodejs;" + [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   ⚡ Starting RUNA Multi-Agent Operations Platform     " -ForegroundColor Cyan
Write-Host "   Tagline: (You define it. We run it.)                 " -ForegroundColor Magenta
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Demo:     operator@runa.ai / Operator123!" -ForegroundColor Yellow
Write-Host ""
node run-dev.js
