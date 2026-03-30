# GamifyHub

## Project Overview

GamifyHub is a React 18 admin panel for managing three gaming engagement features: Leaderboard, Raffle, and Wheel. It provides full CRUD operations for each feature and is backed by `json-server` as a local mock REST API.

---

## Architecture

The codebase is split into three self-contained feature modules under `src/features/` — `leaderboard`, `raffle`, and `wheel`. Each module owns its own `api/` layer (raw axios calls), `composables/` (TanStack Query hooks), `components/` (UI), and `pages/` (route-level orchestration). This boundary keeps concerns isolated: swapping a real backend means only touching the `api/` files.

Shared infrastructure lives in `src/lib/` (axios instance, query client), `src/constants/` (route paths, query keys), `src/types/` (TypeScript interfaces), and `src/schemas/` (Zod validation schemas). Components that are truly reusable across features — `DataTable`, `PageHeader`, `NavigationBlocker` — live in `src/components/common/`.

---

## Tech Stack

| Technology           | Why                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| React                | Industry-standard component model; hooks make stateful logic composable                                                        |
| TypeScript           | Catches shape mismatches between API responses and UI at compile time                                                          |
| MUI (Material UI)    | Full accessible component library so we spend time on features, not styling primitives                                         |
| React Router         | Data router (`createBrowserRouter`) is required for `useBlocker`, which powers the unsaved-changes guard                       |
| TanStack React Query | Handles caching, background refetch, and optimistic updates without boilerplate                                                |
| React Hook Form      | Uncontrolled forms with minimal re-renders; integrates cleanly with Zod via `@hookform/resolvers`                              |
| Zod                  | Single source of truth for validation rules; `z.infer<>` means the form type is always in sync with the schema                 |
| Axios                | Thin wrapper over fetch with interceptors; exported as a single configured instance (`httpClient`)                             |
| notistack            | Drop-in snackbar queue; no custom notification state needed                                                                    |
| json-server          | Zero-config REST mock from `db.json`; v0.17.4 specifically because v1 dropped the `X-Total-Count` header pagination depends on |
| Vite                 | Fast HMR and native ESM; proxies `/api/*` to json-server eliminating CORS config                                               |
| concurrently         | Runs Vite and json-server in one terminal with a single `npm run dev`                                                          |
| Vitest               | Same config as Vite; no separate Jest setup needed                                                                             |

---

## Getting Started

**Requirements:** Node.js 18+

```bash
git clone <repo-url>
cd GamifyHub
npm install
npm run dev
```

This starts both the Vite dev server at `http://localhost:5173` and json-server at `http://localhost:3001`. Vite proxies all `/api/*` requests to json-server, so no environment variables or CORS config is needed.

---

## Available Scripts

| Script               | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| `npm run dev`        | Starts Vite (`:5173`) + json-server (`:3001`) concurrently |
| `npm run server`     | Starts json-server only                                    |
| `npm run build`      | Type-checks and builds for production                      |
| `npm run preview`    | Serves the production build locally                        |
| `npm run type-check` | Runs `tsc --noEmit` without emitting files                 |
| `npm test`           | Runs Vitest in watch mode                                  |
| `npm run test:run`   | Runs Vitest once (CI mode)                                 |

---

## API Reference

All requests go through Vite proxy: `http://localhost:5173/api/*` → `http://localhost:3001/*`

**Leaderboards** — `/api/leaderboards`

| Method | Path                                                               | Description                                                                                               |
| ------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| GET    | `/api/leaderboards?_page=1&_limit=10&status=active&title_like=cup` | Paginated list, returns `X-Total-Count` header                                                            |
| GET    | `/api/leaderboards/:id`                                            | Single record                                                                                             |
| POST   | `/api/leaderboards`                                                | Create — body: `{ title, description, startDate, endDate, status, scoringType, prizes, maxParticipants }` |
| PATCH  | `/api/leaderboards/:id`                                            | Partial update                                                                                            |
| DELETE | `/api/leaderboards/:id`                                            | Delete                                                                                                    |

**Raffles** — `/api/raffles` — same CRUD shape; body includes `name, startDate, endDate, drawDate, status, ticketPrice, maxTicketsPerUser, prizes, totalTicketLimit`

**Wheels** — `/api/wheels` — same CRUD shape; body includes `name, status, segments, maxSpinsPerUser, spinCost, backgroundColor, borderColor`

Pagination params: `_page`, `_limit`, `_sort`, `_order`. Filter params use json-server conventions (`field_like`, `field_gte`, `field_lte`).

---

## Design Decisions

**1. Feature-based სტრუქტურა**
კოდი დაყოფილია სამ დამოუკიდებელ მოდულად (`leaderboard`, `raffle`, `wheel`). ეს არჩევანი გავაკეთე იმიტომ, რომ ახალი feature-ის დამატება ან არსებულის წაშლა დანარჩენ მოდულებს არ ეხება — ყველაფერი, რაც ერთ feature-ს სჭირდება, მის ფოლდერშია მოქცეული.

**2. Optimistic UI**
მუტაციების დროს ოპერაციებზე TanStack Query-ის optimistic update pattern გამოვიყენე: მოთხოვნის გაგზავნამდე cache-ს პირდაპირ ვანახლებ, შეცდომის შემთხვევაში კი ვაბრუნებ წინა მდგომარეობას. ამით UI მყისიერად მომენტალურად სერვერის 300ms delay-ის მიუხედავად, და მომხმარებელი ვერ გრძნობს Pending მდგომარეობას ელემენტს.

**3. Data Router (`createBrowserRouter`)**
React Router v6-ის `useBlocker` hook — რომელიც გამოიყენება `NavigationBlocker` კომპონენტში unsaved changes-ის შემოწმებისთვის — მხოლოდ data router-ის შიგნით მუშაობს. ამიტომ ლეგასი `BrowserRouter` შეიცვალა `createBrowserRouter`-ით, რაც ამ შეზღუდვას აღმოფხვრის.
