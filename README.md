# CityResolve — Full Stack Civic Issue Management Platform

Built with **React 18 + TypeScript + Vite + Tailwind CSS + Supabase**.

## Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + RLS)
- **State**: Local React state (easily swappable for Zustand/React Query)

## Pages
| Route | Description |
|-------|-------------|
| `/` | Home — hero, stats, feature grid, recent issues |
| `/issues` | Public issue browser — filter by category, status, sort by votes/priority |
| `/issues/:id` | Issue detail — timeline, department comments, vote |
| `/report` | Citizen report form — category picker, priority, auto-routing |
| `/dashboard` | Ops dashboard — stats cards, issue table with status updates, dept overview |

## Quick Start

```bash
npm install
cp .env.example .env   # fill in your Supabase URL + anon key
npm run dev
```

> **No Supabase?** The app runs fully on mock data out of the box. No config needed.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Copy your project URL and anon key into `.env`
4. That's it — RLS policies are included

## Deploy

```bash
npm run build   # outputs to dist/
```

Deploy `dist/` to Vercel, Netlify, or any static host.
