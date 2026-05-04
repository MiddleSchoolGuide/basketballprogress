# Hoop Dev — 13U Basketball Progress Tracker

A mobile-first web app for tracking 13U basketball player development: skill ratings, shooting percentages, drill checklists, and progress trends against goals.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Prisma + SQLite** (local prototype; swap to PostgreSQL for production)
- **Tailwind CSS** (dark navy + orange theme)
- **Recharts** (line, bar, progress charts)
- **Lucide React** (icons)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Push database schema
npm run db:push

# 3. Seed with baseline player + 5 sample sessions
npm run db:seed

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema to SQLite |
| `npm run db:seed` | Seed player, goals, sample sessions, drills |
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
DATABASE_URL="file:./prisma/dev.db"
```

## Extending

- **Multiple players**: The schema supports multiple players. Update API calls to use a player selector.
- **PostgreSQL**: Change `provider = "sqlite"` to `"postgresql"` in `prisma/schema.prisma` and update `DATABASE_URL`.
- **Auth**: Add NextAuth.js for coach/parent accounts.
- **Video links**: Add a `videoUrl` field to the `Session` model.
- **Drill library**: Expand `DrillChecklistItem` with difficulty, video, and phase fields.
