# DevSocial - AI-Powered Developer Social Network

A modern, full-stack MVP for an AI-powered developer social network with feed, AI repo cards, live code jams, and a creator marketplace.

## 🏗️ Architecture

**Monorepo (pnpm workspaces)** with the following apps:

- **Web** (`apps/web`): Next.js 14 + React + NextAuth (GitHub OAuth) + Tailwind + Monaco
- **API** (`apps/api`): NestJS (REST) + Prisma ORM + PostgreSQL + **pgvector**
- **Collab** (`apps/collab`): Yjs + y-websocket (real-time collaboration)

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, Monaco Editor
- **Backend**: NestJS, Prisma, PostgreSQL with pgvector extension
- **Auth**: NextAuth with GitHub OAuth
- **Real-time**: Yjs + WebSocket for collaborative editing
- **AI**: OpenAI API for repo summarization and embeddings (with mock fallback)
- **Payments**: Stripe (skeleton implementation)
- **Infrastructure**: Docker Compose for local development

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker and Docker Compose
- GitHub OAuth App credentials (optional, for authentication)
- OpenAI API key (optional, for AI features)

### 1. Clone and Install

```bash
cd gitbook
pnpm install
```

### 2. Configure Environment

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

**Required variables:**
- `DATABASE_URL`: Will be `postgresql://dev:dev@localhost:5432/devsocial?schema=public` after starting Docker
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `JWT_SECRET`: Generate with `openssl rand -base64 32`

**Optional variables:**
- `GITHUB_ID` and `GITHUB_SECRET`: For GitHub OAuth (create at https://github.com/settings/developers)
- `OPENAI_API_KEY`: For AI summaries and embeddings (will use mock mode if not provided)
- `STRIPE_SECRET_KEY`: For marketplace payments (skeleton only)

### 3. Start PostgreSQL with pgvector

```bash
pnpm db:up
```

This starts a PostgreSQL 16 container with the pgvector extension enabled.

### 4. Setup Database

Generate Prisma client and run migrations:

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

Seed the database with demo data:

```bash
pnpm seed
```

### 5. Start All Services

In separate terminals, or use a process manager:

```bash
# Terminal 1: API server (http://localhost:4000)
cd apps/api
pnpm dev

# Terminal 2: Web app (http://localhost:3000)
cd apps/web
pnpm dev

# Terminal 3: Collab server (ws://localhost:1234)
cd apps/collab
pnpm dev
```

Or run all at once (note: output will be mixed):

```bash
pnpm dev
```

### 6. Access the Application

- **Web**: http://localhost:3000
- **API**: http://localhost:4000
- **Collab WS**: ws://localhost:1234

## 📁 Project Structure

```
gitbook/
├── apps/
│   ├── api/                    # NestJS REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema with pgvector
│   │   │   ├── migrations/     # Database migrations
│   │   │   └── seed.ts         # Seed data
│   │   └── src/
│   │       ├── auth/           # JWT authentication
│   │       ├── users/          # User management
│   │       ├── projects/       # GitHub repo projects
│   │       ├── posts/          # Feed posts (repo cards, notes)
│   │       ├── jams/           # Code jam sessions
│   │       ├── search/         # Vector similarity search
│   │       ├── ai/             # AI services (OpenAI integration)
│   │       ├── marketplace/    # Stripe checkout
│   │       └── gdpr/           # Data export & erasure
│   ├── collab/                 # Yjs WebSocket server
│   │   └── src/
│   │       └── index.ts        # y-websocket setup
│   └── web/                    # Next.js 14 App Router
│       └── src/
│           ├── app/
│           │   ├── page.tsx              # Feed (home)
│           │   ├── project/new/          # Create repo card
│           │   ├── jam/[id]/             # Live code collaboration
│           │   ├── marketplace/          # Marketplace (placeholder)
│           │   ├── profile/[handle]/     # User profiles
│           │   └── api/auth/[...nextauth]/ # NextAuth routes
│           └── components/
│               ├── NavBar.tsx            # Navigation
│               └── RepoCard.tsx          # Repo card component
├── packages/
│   ├── config/                 # Shared ESLint, Prettier, Tailwind
│   └── tsconfig/               # Shared TypeScript configs
├── infra/
│   ├── docker-compose.yml      # PostgreSQL + pgvector
│   └── db-init/                # Database init scripts
├── .github/workflows/
│   └── ci.yml                  # GitHub Actions CI
├── pnpm-workspace.yaml         # pnpm workspace config
├── package.json                # Root scripts
└── .env.example                # Environment template
```

## 🎯 Features

### Core MVP Features

- ✅ **GitHub OAuth Authentication**: Sign in with GitHub via NextAuth
- ✅ **AI Repo Cards**: Paste a GitHub URL → AI generates a summary card
- ✅ **Feed**: Personalized feed with repo cards and posts
- ✅ **Live Code Jams**: Real-time collaborative coding with Yjs + Monaco
- ✅ **Vector Search**: pgvector-powered semantic project search
- ✅ **User Profiles**: View profiles with projects and skills
- ✅ **GDPR Compliance**: Data export and erasure endpoints
- 🚧 **Marketplace**: Stripe checkout skeleton (ready to extend)

### AI Features

- **Repo Summarization**: AI-generated bullet points for GitHub repos
- **Embeddings**: Text embeddings stored in PostgreSQL with pgvector
- **Similar Projects**: Cosine similarity search for recommendations
- **Mock Mode**: Automatic fallback when no OpenAI key is configured

## 🔧 Development

### Available Scripts

From the root directory:

```bash
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps
pnpm lint             # Lint all apps
pnpm format           # Format all code with Prettier

pnpm db:up            # Start PostgreSQL with Docker
pnpm db:down          # Stop and remove PostgreSQL container

pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run database migrations
pnpm seed             # Seed database with demo data
```

### Database Management

The Prisma schema includes pgvector support for embeddings:

```bash
# Create a new migration
cd apps/api
pnpm prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# Open Prisma Studio to browse data
pnpm prisma studio
```

### Adding New Modules

**API (NestJS):**

```bash
cd apps/api
nest g module feature-name
nest g service feature-name
nest g controller feature-name
```

**Web (Next.js):**

Create new pages in `apps/web/src/app/your-route/page.tsx`

## 🧪 Testing the MVP

### 1. Sign In

- Navigate to http://localhost:3000
- Click "Sign In" and authenticate with GitHub
- (Skip this step if GitHub OAuth is not configured)

### 2. Create a Repo Card

- Click "New Repo Card" in the nav bar
- Paste a GitHub URL (e.g., `https://github.com/facebook/react`)
- AI will generate a summary and create a post in your feed

### 3. Join a Code Jam

- Click "Join Jam" on any repo card
- Opens a Monaco editor with real-time collaboration via Yjs
- Open the same URL in another browser to see live sync

### 4. Explore Profiles

- Click on any username to view their profile
- See their projects, skills, and posts

### 5. GDPR Export

- Visit http://localhost:4000/gdpr/export (requires auth)
- Download your complete data as JSON

## 🔐 Security & Production

This is an **MVP** and requires hardening for production:

- [ ] Add rate limiting (use `@nestjs/throttler`)
- [ ] Implement proper CSRF protection
- [ ] Add input validation on all endpoints
- [ ] Use production-grade secrets (not `dev_secret`)
- [ ] Enable HTTPS/TLS in production
- [ ] Add logging and monitoring
- [ ] Implement proper error handling
- [ ] Set up database backups
- [ ] Add API authentication tokens for web → API calls

## 📦 Deployment

### Docker

Build production Docker images:

```bash
# API
cd apps/api
docker build -t devsocial-api .

# Web
cd apps/web
docker build -t devsocial-web .

# Collab
cd apps/collab
docker build -t devsocial-collab .
```

### Platform Recommendations

- **Web**: Vercel, Netlify, or Cloudflare Pages
- **API**: Railway, Render, or Fly.io
- **Database**: Supabase (PostgreSQL + pgvector), Railway, or Neon
- **Collab**: Railway, Render, or any Node.js host with WebSocket support

### Environment Variables for Production

Ensure all services have access to:

- `DATABASE_URL`: PostgreSQL connection string with pgvector
- `NEXTAUTH_SECRET`: Production secret
- `JWT_SECRET`: Production secret
- `GITHUB_ID` and `GITHUB_SECRET`: OAuth credentials
- `OPENAI_API_KEY`: AI features
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`: Payments
- `NEXT_PUBLIC_API_URL`: API base URL (e.g., `https://api.yourapp.com`)
- `NEXT_PUBLIC_COLLAB_WS_URL`: WebSocket URL (e.g., `wss://collab.yourapp.com`)

## 🤝 Contributing

This is an MVP starter project. Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this for your own projects!

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# View logs
docker logs devsocial-db

# Restart database
pnpm db:down
pnpm db:up
```

### Prisma Client Issues

```bash
# Regenerate Prisma client
pnpm prisma:generate

# If you see type errors, restart TypeScript server in your editor
```

### Port Already in Use

If ports 3000, 4000, or 1234 are in use, update the ports in `.env`:

```env
# Change ports as needed
PORT=4001
COLLAB_PORT=1235
```

### AI Features Not Working

If you see "Mock AI summary" in repo cards:

1. Add `OPENAI_API_KEY` to your `.env` file
2. Restart the API server
3. The AI service will automatically use OpenAI instead of mocks

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the code comments in each module
3. Open an issue in the repository

---

**Built with ❤️ using GitHub Copilot**
