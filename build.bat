@echo off
setlocal enabledelayedexpansion

:: Get version from manifest.json
for /f "tokens=2 delims=:," %%a in ('findstr "version" manifest.json') do (
    set VERSION=%%~a
)

:: Clean whitespace and quotes
set VERSION=%VERSION: =%
set VERSION=%VERSION:"=%

echo ========================================
echo   JiukBlocker Build Script - v!VERSION!
echo ========================================

:: Ensure versions directory exists
if not exist "versions" (
    echo Creating versions directory...
    mkdir "versions"
)

:: Define the ZIP name
set ZIP_NAME=JiukBlocker_v!VERSION!.zip
set DEST_PATH=versions\!ZIP_NAME!

echo Packing files into !DEST_PATH!...

:: Use PowerShell to compress essential folders and files
powershell -Command "Compress-Archive -Path 'manifest.json', 'background', 'content', 'popup', 'rules', 'assets', 'utils' -DestinationPath '!DEST_PATH!' -Force"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Extension packaged successfully!
    echo Location: !DEST_PATH!
) else (
    echo.
    echo [ERROR] Failed to create ZIP file.
)

echo.
pause
