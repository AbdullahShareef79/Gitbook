# DevSocial - Windows Installation Guide

Complete guide for installing and running DevSocial on Windows.

## 🚀 Quick Start (Automated)

### Option 1: Double-click Installation
1. Download or clone the repository
2. Double-click `install.bat`
3. Follow the on-screen instructions
4. Double-click `start-devsocial.bat` to run

### Option 2: PowerShell Installation
1. Open PowerShell as Administrator
2. Navigate to the project directory:
   ```powershell
   cd path\to\gitbook
   ```
3. Run the installer:
   ```powershell
   .\install.ps1
   ```

---

## 📋 Prerequisites

The installer will check for these, but you can install them manually:

### Required
- **Node.js 18+**: https://nodejs.org/
- **pnpm**: Installed automatically if missing
- **PostgreSQL 14+**: 
  - Download: https://www.postgresql.org/download/windows/
  - Or use Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`

### Optional
- **Docker Desktop**: https://www.docker.com/products/docker-desktop/
- **Git**: https://git-scm.com/download/win

---

## 🛠️ Manual Installation

If you prefer to install manually:

### 1. Install Node.js and pnpm
```powershell
# Install Node.js from https://nodejs.org/
# Then install pnpm
npm install -g pnpm
```

### 2. Install Dependencies
```powershell
pnpm install
```

### 3. Set Up Environment Variables

Copy the example files and edit them:

```powershell
# API
copy apps\api\.env.example apps\api\.env
notepad apps\api\.env

# Web
copy apps\web\.env.local.example apps\web\.env.local
notepad apps\web\.env.local

# Collab
copy apps\collab\.env.example apps\collab\.env
notepad apps\collab\.env
```

### 4. Set Up Database

#### Option A: Local PostgreSQL
1. Install PostgreSQL from https://www.postgresql.org/download/windows/
2. Create database:
   ```powershell
   psql -U postgres
   CREATE DATABASE devsocial;
   \q
   ```
3. Update `apps\api\.env` with your credentials

#### Option B: Docker PostgreSQL
```powershell
docker run -d --name devsocial-db `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=devsocial `
  -p 5432:5432 `
  postgres:15
```

### 5. Run Migrations
```powershell
cd apps\api
pnpm prisma migrate deploy
pnpm prisma db seed  # Optional: adds demo data
cd ..\..
```

### 6. Start the Application
```powershell
pnpm dev
```

---

## 🎯 Available Scripts

Run these from the project root:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services (API, Web, Collab, Worker) |
| `pnpm dev:api` | Start only the API server (port 4000) |
| `pnpm dev:web` | Start only the Web frontend (port 3000) |
| `pnpm dev:collab` | Start only the Collab server (port 3001) |
| `pnpm dev:worker` | Start only the background worker |
| `pnpm build` | Build all apps for production |
| `pnpm test` | Run all tests |
| `pnpm lint` | Check code quality |

---

## 🔧 Configuration

### API Configuration (`apps/api/.env`)

```env
# Database connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/devsocial"

# JWT secret (CHANGE THIS!)
JWT_SECRET="your-super-secret-jwt-key"

# Server port
PORT=4000

# Frontend URL (for CORS)
WEB_ORIGIN="http://localhost:3000"
```

### Web Configuration (`apps/web/.env.local`)

```env
# API URL
NEXT_PUBLIC_API_URL="http://localhost:4000"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# GitHub OAuth (required for login)
GITHUB_ID="your-github-oauth-app-id"
GITHUB_SECRET="your-github-oauth-app-secret"
```

### Setting Up GitHub OAuth

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: DevSocial Local
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to `apps/web/.env.local`

---

## 🐛 Troubleshooting

### Port Already in Use
If ports 3000, 4000, or 3001 are in use:

```powershell
# Find process using port
netstat -ano | findstr :3000

# Kill process (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

### Database Connection Failed
1. Check PostgreSQL is running:
   ```powershell
   # If using service
   sc query postgresql

   # If using Docker
   docker ps | findstr postgres
   ```

2. Verify `DATABASE_URL` in `apps/api/.env`
3. Test connection:
   ```powershell
   cd apps\api
   pnpm prisma db push
   ```

### pnpm Command Not Found
```powershell
# Reinstall pnpm
npm install -g pnpm

# Or use npm directly
npm install
npm run dev
```

### Permission Denied Errors
Run PowerShell or Command Prompt as Administrator:
1. Right-click PowerShell/CMD
2. Select "Run as administrator"

### Prisma Migration Errors
```powershell
cd apps\api

# Reset database (WARNING: destroys all data)
pnpm prisma migrate reset

# Or push schema without migrations
pnpm prisma db push
```

### Node Version Errors
If you see "requires Node version >= 18":
1. Uninstall old Node.js
2. Install Node.js 18+ from https://nodejs.org/
3. Restart terminal
4. Verify: `node --version`

---

## 🔒 Security Notes

### For Development
The default configuration works for local development.

### For Production
Before deploying, you MUST change:

1. **JWT_SECRET** - Generate a strong random secret
2. **NEXTAUTH_SECRET** - Generate a strong random secret
3. **Database credentials** - Use strong passwords
4. **GitHub OAuth** - Create production OAuth app
5. **CORS settings** - Set to your domain only

Generate secrets:
```powershell
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 📦 Building for Production

```powershell
# Build all apps
pnpm build

# Build specific app
pnpm build:api
pnpm build:web
pnpm build:collab

# Start production servers
pnpm start
```

---

## 🐳 Using Docker (Alternative)

If you prefer Docker:

```powershell
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📚 Additional Resources

- [README.md](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [API_ADVANCED_FEATURES.md](./API_ADVANCED_FEATURES.md) - API documentation
- [FEATURES_COMPLETE.md](./FEATURES_COMPLETE.md) - Feature list

---

## 💡 Tips

### Windows Terminal
For better terminal experience, install Windows Terminal:
- Microsoft Store: "Windows Terminal"
- Or download from: https://aka.ms/terminal

### VS Code Extensions
Recommended extensions:
- ESLint
- Prettier
- Prisma
- TypeScript Vue Plugin (Volar)

### Performance
- Use SSD for better performance
- Close unnecessary applications
- Consider WSL2 for Linux-like environment

---

## ❓ Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Search existing issues: https://github.com/AbdullahShareef79/Gitbook/issues
3. Create new issue with:
   - Windows version
   - Node.js version (`node --version`)
   - pnpm version (`pnpm --version`)
   - Error messages
   - Steps to reproduce

---

## 🎉 Success!

Once installed, you should see:

```
DevSocial is running!

API:    http://localhost:4000
Web:    http://localhost:3000
Collab: http://localhost:3001

Press Ctrl+C to stop
```

Open your browser to http://localhost:3000 and start coding! 🚀
