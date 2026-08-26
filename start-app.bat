@echo off
title Agentra AI - Local Server
set PATH=C:\Program Files\nodejs;%PATH%
echo ========================================================
echo   🚀 Starting Agentra Multi-Agent Platform
echo ========================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo User:     operator@agentra.ai / Operator123!
echo.
node run-dev.js
pause
