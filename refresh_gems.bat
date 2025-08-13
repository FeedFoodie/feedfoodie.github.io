@echo off
cls

:: Define a log file to capture all output for debugging
set LOG_FILE=refresh_log.txt

:: Delete the old log file to start fresh
if exist %LOG_FILE% del %LOG_FILE%

echo.
echo ====================================================================
echo == Refreshing Jekyll Dependencies for Cross-Platform Builds      ==
echo ====================================================================
echo.
echo This script will now log all detailed output to '%LOG_FILE%'.
echo The log file will open automatically when the script is finished.
echo.
pause

:: --- Start of logging block ---
(
    echo [1/4] Deleting old Gemfile.lock...
    if exist Gemfile.lock (
        del Gemfile.lock
        echo      Done.
    ) else (
        echo      Gemfile.lock not found, skipping.
    )
    echo.

    echo [2/4] Running 'bundle install' to create a new lock file...
    bundle install
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: 'bundle install' failed.
        exit /b %errorlevel%
    )
    echo      Done.
    echo.

    echo [3/4] Adding Linux platform to Gemfile.lock...
    bundle lock --add-platform x86_64-linux
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Failed to add Linux platform.
        exit /b %errorlevel%
    )
    echo      Done.
    echo.

    echo [4/4] Verifying 'Gemfile.lock'...
    findstr /C:"x86_64-linux" Gemfile.lock > nul
    if %errorlevel% equ 0 (
        echo      SUCCESS! The platform 'x86_64-linux' was found in Gemfile.lock.
    ) else (
        echo.
        echo      ERROR: Verification failed. The Linux platform was not added.
    )

) >> %LOG_FILE% 2>&1
:: --- End of logging block ---

echo.
echo ====================================================================
echo ==  PROCESS COMPLETE!                                           ==
echo ====================================================================
echo.
echo Opening the log file '%LOG_FILE%' for review...
echo.

:: Open the log file in Notepad so the user can see the results
start notepad %LOG_FILE%

REM The final pause is a fallback in case notepad fails to start
pause
