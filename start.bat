@echo off
echo =======================================
echo     Starting FixMyCV Application
echo =======================================
echo.

echo [1/2] Starting Backend API Server (Port 5002)...
cd backend
start "FixMyCV Backend" cmd /k "set PORT=5002 && npm install && node server.js"
cd ..

echo [2/2] Starting Frontend Vite Server...
cd frontend
start "FixMyCV Frontend" cmd /k "npm install && npm run dev"
cd ..

echo.
echo =======================================
echo      Servers are booting up!
echo =======================================
echo.
echo * A new terminal window has opened for the Backend.
echo * A new terminal window has opened for the Frontend.
echo.
echo Frontend will be running at: http://localhost:5176
echo Backend API is running at: http://localhost:5002
echo.
echo (You can close this window now)
pause
