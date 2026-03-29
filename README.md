# MaidBoard

MaidBoard is a household task management web application built for families with a domestic helper. It has two focused interfaces:

- `Board` for shared iPad usage (simple touch-first daily task board)
- `Admin` for household owner (secure login, task management, and progress insights)

## Stack

- Next.js (App Router, TypeScript)
- Prisma ORM
- PostgreSQL (Supabase-friendly)
- JWT cookie auth for admin sessions

## System Architecture

### Interfaces

- `GET /board` (shared helper view)
- `GET /admin/*` (owner dashboard, protected by auth session)

### Backend Layers

- `app/api/*`: route handlers for auth, board interactions, and admin data
- `lib/*`: domain logic
  - auth/session handling
  - recurring task generation
  - history/progress aggregation
  - household isolation helpers

### Data Model

- `Household`: tenant boundary
- `AdminUser`: authenticated owner account tied to household
- `TaskTemplate`: recurring task definitions
- `DailyTask`: per-day snapshot task instance generated from templates

All mutable task actions happen on `DailyTask` rows, preserving history independently from template edits.

## Core Behavior

- Templates support:
  - `timeBlock`: MORNING / AFTERNOON / EVENING
  - `frequencyType`: DAILY / WEEKDAYS
  - optional `weekdays` array
- Daily tasks are generated from active templates with de-duplication by:
  - `@@unique([householdId, date, templateId])`
- Task state:
  - `PENDING`, `COMPLETED`, `SKIPPED`
  - completion and skip timestamps captured

## Project Structure

```txt
app/
  api/
    auth/
    board/
    admin/
  admin/
    login/
    tasks/
    history/
  board/
components/
  admin/
  board/
  ui/
lib/
prisma/
```

## Run Locally

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

3. Create and migrate the database

```bash
npm run db:migrate -- --name init
```

4. Seed default household, admin user, and starter templates

```bash
npm run db:seed
```

5. Start development server

```bash
npm run dev
```

## Default Login

- Email: `owner@maidboard.local`
- Password: `ChangeThisStrongPassword123!`

Change these values in `.env` before production.

## Key Routes

- `/board`
- `/admin/login`
- `/admin`
- `/admin/tasks`
- `/admin/history`

## Deploy to Vercel + Supabase

Set these environment variables in Vercel:

- `DATABASE_URL` (Supabase pooled connection string)
- `DIRECT_URL` (Supabase direct connection string)
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `DEFAULT_HOUSEHOLD_NAME`
- `DEFAULT_HOUSEHOLD_SLUG`

Use this build command:

```bash
npm run vercel-build
```

After first deploy, run seed once against production database:

```bash
npm run db:seed
```

