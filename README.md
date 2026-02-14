# Kadan - Tonizao Dashboard

A personal productivity dashboard for tracking habits, SMART goals, and project tasks.

## Features

- **Habit Tracking** — Daily habits with streak counting across 6 categories (routine, health, growth, family, work, finance)
- **SMART Goals** — Track progress toward goals with visual progress bars
- **Kanban Board** — Drag-and-drop task management with Backlog, In Progress, and Done columns
- **Daily Status** — Notes for what was done and what's next, per project per day
- **Multi-project** — Switch between projects (Strachwitz Consulting & Chaunce Foods)
- **Authentication** — Secure sign-in/sign-up via Clerk

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Neon serverless) with Drizzle ORM
- **Auth:** Clerk
- **Validation:** Zod

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your real values:

```bash
cp .env.example .env.local
```

You'll need:
- A [Neon](https://neon.tech) PostgreSQL database (free tier available)
- A [Clerk](https://clerk.com) application (free tier available)

### 3. Set up the database

Generate and run migrations:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Seed default data (optional)

After signing in, call the seed endpoint to populate starter habits and goals:

```bash
# From the browser console, or use the app's built-in seeding
fetch('/api/seed', { method: 'POST' })
```

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes (habits, goals, tasks, status, seed)
│   ├── sign-in/      # Clerk sign-in page
│   ├── sign-up/      # Clerk sign-up page
│   ├── page.tsx      # Main dashboard
│   └── layout.tsx    # Root layout with Clerk Provider
├── components/       # React components (KanbanBoard, HabitsSection, etc.)
├── lib/              # Database, auth, validation, utilities
└── types/            # TypeScript interfaces and constants
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## API Routes

All API routes require authentication via Clerk.

### Tasks
- `GET /api/tasks?project={project}` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Habits
- `GET /api/habits` - List habits
- `POST /api/habits` - Create habit
- `PUT /api/habits/[id]` - Toggle habit completion
- `DELETE /api/habits/[id]` - Delete habit

### Goals
- `GET /api/goals` - List goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/[id]` - Update goal progress
- `DELETE /api/goals/[id]` - Delete goal

### Status
- `GET /api/status?project={project}&date={YYYY-MM-DD}` - Get status
- `POST /api/status` - Update status
- `GET /api/status/history?days={number}` - Get status history

## Deployment

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed deployment instructions including:
- Security pre-deployment checklist
- Database backup strategy
- GitHub setup
- Vercel deployment guide

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/new)
3. Import your repository
4. Set environment variables:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
5. Deploy!

**Important**: Review the security checklist in `DEPLOYMENT_CHECKLIST.md` before deploying to production.

## Security Features

- ✅ Authentication required for all API routes
- ✅ Row-level security (users can only access their own data)
- ✅ Input validation with Zod schemas
- ✅ SQL injection protection via Drizzle ORM
- ✅ Rate limiting (100 requests/hour per user)
- ✅ Environment variables properly excluded from version control

## Database Schema

### Tables

- **users**: User accounts (linked to Clerk)
  - `id`, `clerkId`, `email`, `createdAt`, `updatedAt`

- **tasks**: Kanban tasks
  - `id`, `userId`, `project`, `text`, `status`, `date`, `createdAt`, `updatedAt`

- **habits**: Daily habits with completion tracking
  - `id`, `userId`, `text`, `category`, `value`, `completedDates[]`, `longestStreak`, `createdAt`, `updatedAt`

- **goals**: Measurable goals
  - `id`, `userId`, `text`, `target`, `unit`, `progress`, `category`, `project`, `createdAt`, `updatedAt`

- **status_entries**: Daily status updates
  - `id`, `userId`, `project`, `whatDone`, `whatNext`, `date`, `createdAt`, `updatedAt`
  - Unique constraint: `(userId, project, date)`

## Development

### Database Commands

```bash
# Generate migration
npx drizzle-kit generate

# Push schema to database (recommended for development)
npx drizzle-kit push

# Open Drizzle Studio (database GUI)
npx drizzle-kit studio
```

### Environment Variables

See `.env.example` for all required environment variables.

## License

MIT License - See LICENSE file for details (if applicable)
