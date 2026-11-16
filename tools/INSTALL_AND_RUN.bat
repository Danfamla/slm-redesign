
@echo off
chcp 65001 >nul
cd /d "%~dp0.."

py -m pip install requests beautifulsoup4
if errorlevel 1 (
    echo Python libraries installation failed.
    pause
    exit /b 1
)

py tools\fetch_images.py

echo.
echo Finished. Check catalog-download-report.json
pause
