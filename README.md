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
