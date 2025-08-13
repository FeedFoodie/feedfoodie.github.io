@echo off
echo.
echo --- Refreshing Jekyll Dependencies for Cross-Platform Builds ---
echo.

REM Step 1: Delete the old Gemfile.lock to ensure a clean slate.
echo [1/3] Deleting old Gemfile.lock...
if exist Gemfile.lock (
    del Gemfile.lock
    echo      Done.
) else (
    echo      Gemfile.lock not found, skipping.
)
echo.

REM Step 2: Run bundle install to generate a new lock file for Windows.
echo [2/3] Running 'bundle install'...
bundle install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Bundle install failed. Please check the errors above.
    pause
    exit /b %errorlevel%
)
echo      Done.
echo.

REM Step 3: Add the Linux platform for GitHub Actions compatibility.
echo [3/3] Adding Linux platform to Gemfile.lock...
bundle lock --add-platform x86_64-linux
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to add Linux platform.
    pause
    exit /b %errorlevel%
)
echo      Done.
echo.

echo --- SUCCESS! Your Gemfile.lock is now ready. ---
echo.
pause
