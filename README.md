# Urban Nest — Hostel & Paying Guest Discovery Platform

Urban Nest is a full-stack hostel and paying guest (PG) accommodation discovery platform built for students and working professionals. Visitors can search for stays by city, locality, rent, room sharing, gender policy, and amenities, compare rent breakdowns, save favourites, and contact property owners directly via WhatsApp, phone, or email.

---

## 1. Technology Stack

- **Monorepo**: npm workspaces (`shared`, `server`, `client`)
- **Frontend (`client/`)**: React 18 + Vite + TypeScript + Tailwind CSS + React Router + TanStack Query + React Hook Form + Zod + Lucide React
- **Backend (`server/`)**: Node.js + Express.js + TypeScript + Mongoose + Express Session (`connect-mongo`, HTTP-only cookies) + Helmet + Express Rate Limit
- **Shared (`shared/`)**: Shared TypeScript DTO interfaces & Zod validation schemas
- **Database**: MongoDB (`mongodb://127.0.0.1:27017/urban-nest`) with automatic zero-config fallback to `mongodb-memory-server` and automatic sample data seeding in development
- **Image Uploads**: Signed Cloudinary upload endpoint (`POST /api/v1/owner/listings/:id/photos`) with direct URL and curated photo presets fallback
- **Testing**: Vitest + Supertest (Backend API & Role integration tests) + React Testing Library (Frontend component tests)

---

## 2. Quick Start

```bash
# 1. Install all workspace dependencies
npm install

# 2. Start both the Express API server (port 5000) and Vite React client (port 5173)
npm run dev
```

- **Frontend URL**: `http://localhost:5173`
- **Backend API Base**: `http://localhost:5000/api/v1`

### Pre-Seeded Demo Accounts (Password for all: `Password123!`)
| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Student / Renter** | `student@urbannest.in` | Browse, filter, save favourites, report inaccurate listings, manage profile |
| **Property Owner** | `owner@urbannest.in` | Create & edit PG/hostel listings, manage availability, request photo upload signatures, submit for moderation |
| **Administrator** | `admin@urbannest.in` | Approve/reject/suspend listings, review user reports, manage user & owner verification |

---

## 3. Useful Scripts

- `npm run dev` — Run backend and frontend concurrently
- `npm run build` — Typecheck and build `shared`, `server`, and `client`
- `npm test` — Run backend Supertest suite and frontend Vitest suite
- `npm run seed` — Force re-seed the database with sample users, listings, favourites, and reports
