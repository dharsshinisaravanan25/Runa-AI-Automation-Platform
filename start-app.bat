@echo off
title RUNA - (You define it. We run it.)
set PATH=C:\Program Files\nodejs;%PATH%
echo ========================================================
echo   ⚡ Starting RUNA Multi-Agent Operations Platform
echo   Tagline: (You define it. We run it.)
echo ========================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo User:     operator@runa.ai / Operator123!
echo.
node run-dev.js
pause
