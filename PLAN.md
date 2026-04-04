# Headache Tracker — MVP Plan

## Overview
A web app where authenticated users log headache episodes (date, intensity, notes),
visualize them on a calendar, search through them, and export to Excel / PDF.

---

## Tech Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Auth | NextAuth.js v5 (Google + Facebook) |
| ORM | Drizzle ORM |
| Database | Neon (PostgreSQL serverless) |
| Export | xlsx (Excel) + @react-pdf/renderer (PDF) |
| Deployment | Vercel + Neon |
| Source | GitHub |

---

## Database Schema

```
users          – managed by NextAuth adapter
episodes       – core table (see schema.ts)
```

### episodes table
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| user_id | text FK | → users.id |
| date | date | NOT NULL |
| intensity | integer | 1–10, nullable |
| notes | text | nullable |
| created_at | timestamp | default now() |
| updated_at | timestamp | default now() |

---

## MVP Feature Scope

### Auth
- [ ] Social login: Google + Facebook via NextAuth
- [ ] Session-aware API routes (users only see their own data)

### Episodes CRUD
- [ ] Create episode (date required, intensity + notes optional)
- [ ] Edit episode
- [ ] Delete episode (with confirmation)

### Calendar View (main screen)
- [ ] Monthly calendar showing dots/badges on days with episodes
- [ ] Click a day → side panel lists episodes for that day
- [ ] Intensity color coding (green → yellow → red)

### Search
- [ ] Filter by date range
- [ ] Filter by intensity range (slider)
- [ ] Free-text search in notes

### Export
- [ ] Export filtered list → Excel (.xlsx)
- [ ] Export filtered list → PDF

---

## Project Structure

```
headache-tracker/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx          # Login page
│   ├── (app)/
│   │   ├── layout.tsx              # Authenticated shell
│   │   ├── page.tsx                # Calendar view (home)
│   │   └── episodes/
│   │       └── page.tsx            # Search + list view
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── episodes/
│   │       ├── route.ts            # GET (list) + POST (create)
│   │       └── [id]/route.ts       # PUT + DELETE
│   └── layout.tsx
├── components/
│   ├── calendar/
│   │   ├── HeadacheCalendar.tsx
│   │   └── DayDetail.tsx
│   ├── episodes/
│   │   ├── EpisodeForm.tsx
│   │   ├── EpisodeList.tsx
│   │   └── EpisodeCard.tsx
│   ├── export/
│   │   ├── ExportExcel.tsx
│   │   └── ExportPDF.tsx
│   └── ui/                         # shadcn components live here
├── lib/
│   ├── db.ts                       # Neon + Drizzle client
│   ├── auth.ts                     # NextAuth config
│   └── utils.ts
├── drizzle/
│   └── schema.ts
├── drizzle.config.ts
└── .env.local
```

---

## Environment Variables (.env.local)

```env
# Neon
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Facebook OAuth
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

---

## MVP Phases

### Phase 1 – Foundation (Day 1–2)
- Init Next.js project with Tailwind + shadcn
- Configure Neon database
- Set up Drizzle schema + run first migration
- Wire up NextAuth with Google provider (Facebook second)

### Phase 2 – Core CRUD (Day 3–4)
- API routes: GET / POST / PUT / DELETE episodes
- EpisodeForm component (date picker, intensity slider, notes textarea)
- EpisodeList component (simple table)

### Phase 3 – Calendar View (Day 5–6)
- HeadacheCalendar component (month grid)
- Day badges with intensity colors
- DayDetail side panel

### Phase 4 – Search (Day 7)
- Filter bar (date range + intensity + notes search)
- Connect filters to API query params

### Phase 5 – Export (Day 8)
- Excel export with xlsx
- PDF export with @react-pdf/renderer

### Phase 6 – Polish & Deploy (Day 9–10)
- Responsive mobile layout
- Loading states + error boundaries
- Deploy to Vercel + connect Neon production DB

---

## Key Dependencies to Install

```bash
npx create-next-app@latest headache-tracker --typescript --tailwind --app
cd headache-tracker

# shadcn
npx shadcn@latest init

# Auth
npm install next-auth@beta @auth/drizzle-adapter

# Database
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Export
npm install xlsx
npm install @react-pdf/renderer

# Date utilities
npm install date-fns

# Misc
npm install lucide-react zod react-hook-form @hookform/resolvers
```
