# Workspace

## Overview

VolunteerConnect — a full-stack volunteer management platform for two user roles (Volunteer and Organizer).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Tailwind CSS, Shadcn/ui, React Query, React Leaflet)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/          # Express API server
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── auth.ts       # JWT helpers, requireAuth middleware
│   │       │   └── matching.ts   # Intelligent matching engine
│   │       └── routes/
│   │           ├── auth.ts       # Signup/login/me
│   │           ├── volunteers.ts # Profile, stats
│   │           ├── events.ts     # CRUD, recommendations
│   │           ├── applications.ts # Apply, my apps, accept/reject
│   │           └── organizers.ts # Profile, events, stats, NGO verify
│   └── volunteer-connect/   # React + Vite frontend
│       └── src/
│           ├── pages/
│           │   ├── landing.tsx
│           │   ├── auth.tsx
│           │   ├── volunteer/dashboard.tsx
│           │   ├── volunteer/profile.tsx
│           │   ├── volunteer/rsvps.tsx
│           │   ├── volunteer/map-view.tsx
│           │   └── organizer/dashboard.tsx
│           │   └── organizer/create-event.tsx
│           └── components/
│               ├── EventCard.tsx
│               ├── Map.tsx
│               └── layout/DashboardLayout.tsx
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas from OpenAPI
│   └── db/src/schema/
│       ├── users.ts         # users table
│       ├── volunteers.ts    # volunteers table
│       ├── organizers.ts    # organizers table
│       ├── events.ts        # events table
│       └── applications.ts  # applications table
```

## Features

### Authentication
- JWT auth, 7-day expiry
- Two roles: volunteer, organizer
- Stored in localStorage (key: "token", "userRole")

### Volunteer Features
- Dashboard with stats (hours, events, categories)
- Smart event recommendations with match % (skills×50% + location×20% + interests×20% + availability×10%)
- Interactive Leaflet map with color-coded markers (green=High, yellow=Medium, gray=Low)
- Apply to events, track RSVP status (Pending/Accepted/Rejected)
- Profile/portfolio page

### Organizer Features
- Create events (Government, Private, NGO types)
- NGO verification via registration number (format: 5-20 alphanumeric chars)
- Private events have optional payment amount
- Manage applicants: view match scores, accept/reject
- Analytics dashboard (event counts, application stats)
- Urgent events highlighted with red badge

### Intelligent Matching Engine
- Skills match: 50% weight
- Location proximity: 20% weight (haversine distance)
- Interest match: 20% weight
- Availability: 10% weight
- Labels: High Match (75%+), Medium (40–74%), Low (<40%)

## Demo Accounts
- Volunteer: priya@demo.com / demo1234
- NGO Organizer: greenearth@demo.com / demo1234
- Private Organizer: techbridge@demo.com / demo1234
- Govt Organizer: dmc@demo.com / demo1234

## Codegen
Run: `pnpm --filter @workspace/api-spec run codegen`

## DB Migrations
Dev: `pnpm --filter @workspace/db run push`
