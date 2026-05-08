# Hoop Dev — 13U Basketball Progress Tracker

A mobile-first web app for tracking 13U basketball player development: skill ratings, shooting percentages, drill checklists, and progress trends against goals.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Prisma + PostgreSQL**
- **Tailwind CSS** (dark navy + orange theme)
- **Recharts** (line, bar, progress charts)
- **Lucide React** (icons)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set DATABASE_URL in .env.local
# 3. Push database schema
npm run db:push

# 4. Seed with baseline player + 5 sample sessions
npm run db:seed

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema to the configured database |
| `npm run db:seed` | Seed or reseed the baseline player, goals, drills, and sample sessions |
| `npm run db:studio` | Open Prisma Studio (visual DB editor) |

## Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Dev score, trends, targets, recommendations |
| Log Session | `/session/new` | 5-step form to record a training session |
| History | `/history` | All sessions, expandable, edit/delete |
| Drills | `/drills` | Daily drill checklist with completion tracking |
| Profile | `/profile` | Player info, baseline → current → target view |

## Development Score Formula

Weighted 0–100 score across 7 metrics:

| Metric | Weight |
|---|---|
| Left-Hand Control | 20% |
| Form Shooting | 20% |
| Free Throw % | 15% |
| Spot Shooting % | 15% |
| Footwork | 15% |
| Stop-and-Pop Speed | 10% |
| Confidence | 5% |

## 2-Week Targets

| Metric | Baseline | Target |
|---|---|---|
| Left-Hand Control | 2/10 | 5/10 |
| Form Shooting | 4/10 | 6/10 |
| Free Throws | 30% | 50% |
| Spot Shooting | 30% | 42% |
| Footwork | 3/10 | 6/10 |

## Environment

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

## Railway Deployment

1. Create a Railway project from this repository.
2. Add a PostgreSQL service in Railway.
3. Set the app service `DATABASE_URL` variable from the PostgreSQL connection string.
4. This repo includes [`railway.json`](</abs/path/C:/Users/sidep/WebstormProjects/basketball_progress/railway.json>) so Railway uses:
   - Build: `npm run build`
   - Start: `npm start`
5. Deploy once so Railway runs `prisma migrate deploy` during the build.
6. Seed the database once after the first successful deploy with:
   ```bash
   npm run db:seed
   ```

If you prefer to configure Railway by hand instead of relying on `railway.json`, use the same build and start commands above.

The seed flow is rerunnable. It updates player `id=1` and replaces the baseline seeded goals, drills, and sample sessions so repeated runs do not accumulate duplicates.

## Android Client Configuration

The Android app in `Basketballhelp` expects this service to expose:

- `GET /api/players`
- `POST /api/players`
- `GET /api/players/{id}`
- `PUT /api/players/{id}`
- `GET /api/sessions?playerId=1`
- `GET /api/sessions?playerId=1&limit=n`
- `POST /api/sessions`
- `GET /api/sessions/{id}`
- `PUT /api/sessions/{id}`
- `DELETE /api/sessions/{id}`
- `GET /api/goals?playerId=1`
- `POST /api/goals`
- `GET /api/drills?date=yyyy-MM-dd`
- `POST /api/drills`

Point the Android app's `HOOP_DEV_BASE_URL` at the deployed Railway URL with a trailing slash.

## Extending

- **Multiple players**: The schema supports multiple players. Update API calls to use a player selector.
- **Auth**: Add NextAuth.js for coach/parent accounts.
- **Video links**: Add a `videoUrl` field to the `Session` model.
- **Drill library**: Expand `DrillChecklistItem` with difficulty, video, and phase fields.
