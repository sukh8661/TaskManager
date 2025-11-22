# PowerShell script to fix Prisma EPERM errors
Write-Host "Fixing Prisma client generation..." -ForegroundColor Yellow

# Stop any running Node processes
Write-Host "Stopping Node.js processes..." -ForegroundColor Cyan
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Remove .prisma folder
Write-Host "Cleaning Prisma cache..." -ForegroundColor Cyan
if (Test-Path "node_modules\.prisma") {
    Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
}

# Regenerate Prisma client
Write-Host "Regenerating Prisma client..." -ForegroundColor Cyan
npx prisma generate

# Push schema
Write-Host "Pushing schema to database..." -ForegroundColor Cyan
npx prisma db push

Write-Host "Done! You can now start the server with: npm run dev" -ForegroundColor Green

