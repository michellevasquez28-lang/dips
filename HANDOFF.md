# DiPs — Handoff Document

**Project:** Dartmouth Innovative Projects Studio (DiPs)  
**Repo:** https://github.com/michellevasquez28-lang/dips  
**Last working state:** Local dev fully functional. Netlify deployment partially broken (see §7).  
**Date:** June 2026

---

## 1. What This Is

A gallery web app for Dartmouth students to share creative and research projects. Think Pinterest meets an art gallery — projects appear as paintings in ornate frames on an infinite scroll canvas. Users can upload work, like and comment on projects, message collaborators, and have full profile pages.

---

## 2. Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Express + TypeScript (Node 18) |
| Database | PostgreSQL via **Neon** (serverless Postgres, free tier) |
| ORM | Prisma 5 |
| Auth | JWT (30-day tokens), `@dartmouth.edu` email check |
| Serverless (prod) | Netlify Functions via `serverless-http` |
| Fonts | Cormorant Garamond + Caveat (Google Fonts) |

---

## 3. Monorepo Structure

```
my_site/
├── client/               # Vite + React frontend
│   ├── src/
│   │   ├── App.tsx               # Root — view routing (gallery/messages/profile)
│   │   ├── components/
│   │   │   ├── Canvas.tsx        # Infinite-scroll frame canvas
│   │   │   ├── Frame.tsx         # Individual floating frame
│   │   │   ├── Sidebar.tsx       # Left nav panel
│   │   │   ├── ProjectModal.tsx  # Project detail overlay
│   │   │   ├── UploadModal.tsx   # 3-step upload (file → frame → preview)
│   │   │   ├── LoginModal.tsx    # Email-only Dartmouth login
│   │   │   ├── ProfileSetupModal.tsx  # First-login profile setup
│   │   │   ├── MessagesPage.tsx  # Full-screen messages view
│   │   │   └── MessageModal.tsx  # Send message overlay
│   │   ├── pages/
│   │   │   └── ProfilePage.tsx   # Full-screen user profile + project grid
│   │   ├── hooks/
│   │   │   └── useProjects.ts    # Projects state + API calls
│   │   ├── lib/
│   │   │   ├── api.ts            # Central API client (all fetch calls)
│   │   │   └── pdfSetup.ts       # pdfjs-dist worker config
│   │   └── types/index.ts        # Shared TypeScript interfaces
│   ├── public/           # logo.png, frames/frame-1.png … frame-18.png
│   ├── tailwind.config.cjs       # MUST be .cjs (ESM conflict fix)
│   ├── postcss.config.js         # Points at tailwind.config.cjs explicitly
│   └── package.json
├── server/
│   ├── src/
│   │   ├── index.ts      # Local dev entry (listens on PORT=5001)
│   │   └── app.ts        # Express app — mounts all routers
│   ├── routes/
│   │   ├── auth.ts       # POST /api/auth/dartmouth
│   │   ├── projects.ts   # CRUD + like toggle
│   │   ├── comments.ts   # POST comment, GET by project
│   │   ├── messages.ts   # Send + inbox + thread
│   │   └── users.ts      # GET profile, PATCH profile
│   ├── netlify-fn/
│   │   └── api.ts        # Netlify serverless function entry point
│   ├── prisma/
│   │   ├── schema.prisma # Full schema with User profile fields
│   │   └── seed.ts       # 8 users + 20 projects — run to populate DB
│   └── package.json
├── netlify.toml          # Build command + redirects
└── .claude/launch.json   # Preview server config (npm run dev --prefix client)
```

---

## 4. How to Run Locally

**Prerequisites:** Node 18+, a Neon database URL in `server/.env`

```bash
# Terminal 1 — backend (port 5001)
cd server && npm install && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm install && npm run dev
```

Open: http://localhost:5173

**Environment file** — `server/.env` (never committed):
```
PORT=5001
DATABASE_URL=postgresql://...  ← your Neon connection string
JWT_SECRET=<long random hex>
ADMIN_EMAIL=yourname@dartmouth.edu   ← this account can delete any project
```

---

## 5. Database

- **Provider:** Neon (neon.tech) — free tier, PostgreSQL
- **ORM:** Prisma 5
- **Apply schema changes:** `cd server && npx prisma db push`
- **Re-seed demo data:** `cd server && npx ts-node prisma/seed.ts`

### User model (key profile fields added this session)
```prisma
model User {
  pronouns          String?
  bio               String?
  classYear         Int?
  major             String?
  photoUrl          String?  @db.Text   ← base64 avatar
  clubs             String?             ← JSON array
  workExperiences   String?             ← JSON array of {title, org, years}
  linkedinUrl       String?
  isProfileComplete Boolean @default(false)
}
```

Images and PDFs are stored as **base64 data URLs** in PostgreSQL `TEXT` fields (no Cloudinary needed).

---

## 6. Features Implemented

| Feature | Status | Notes |
|---|---|---|
| Infinite-scroll frame canvas | ✅ | 18 frame styles, floating bob animation |
| Upload modal (image/PDF) | ✅ | 3-step: file → frame assignment → preview |
| PDF thumbnail generation | ✅ | Rendered at frame aspect ratio with pdfjs-dist |
| Project modal (likes, comments, messages) | ✅ | |
| Dartmouth email login | ✅ | Email only — no name on repeat logins |
| Profile setup modal | ✅ | Shown once on first login |
| Full-screen profile page | ✅ | Instagram-style 3-col project grid + edit |
| "My Profile" in sidebar | ✅ | Clicking name/avatar navigates to own profile |
| Admin delete | ✅ | Set `ADMIN_EMAIL` env var — can delete any project |
| Persistent storage | ✅ | Neon PostgreSQL — survives server restarts |
| 20 seed projects + 8 profiles | ✅ | SVG slide images, comments, likes |
| Messages / inbox / threads | ✅ | |
| Search + filter | ✅ | By department, type, tags, year |
| Google OAuth | ⛔ | Removed for local demo. Code was written and can be re-added (see §7) |
| Netlify deployment | ⚠️ | Build passes locally. Needs env vars set in Netlify dashboard (see §7) |

---

## 7. Netlify Deployment — What's Left

The build **passes locally** (`npm run build` in `client/` succeeds). The Netlify deploy was failing due to:
1. ✅ Hardcoded absolute paths in `tailwind.config` — **fixed** (renamed to `.cjs`)
2. ✅ TypeScript errors — **fixed**
3. ⚠️ Env vars may not be fully set in Netlify dashboard yet

### To complete Netlify deployment:

**Set these env vars in Netlify → Site config → Environment variables:**
```
DATABASE_URL          postgresql://...   (Neon, secret)
JWT_SECRET            <long hex>         (secret)
ADMIN_EMAIL           name@dartmouth.edu (secret)
GOOGLE_CLIENT_ID      (optional, for Google OAuth)
VITE_GOOGLE_CLIENT_ID (optional, same value as above — baked into frontend bundle)
```

**To re-add Google OAuth** (was working, then removed for simplicity):
- Backend: restore `POST /api/auth/google` route in `server/routes/auth.ts` using `google-auth-library`
- Frontend: restore `<GoogleOAuthProvider>` in `main.tsx` and `<GoogleLogin>` in `LoginModal.tsx`
- Requires Google Cloud Console project with OAuth 2.0 Web Client credentials
- Restrict to `hosted_domain: 'dartmouth.edu'`

---

## 8. Auth Flow

```
Login (email only)
  │
  ├─ existing user → JWT returned, isNewUser=false → straight to gallery
  │                  (all their projects, messages, profile intact)
  │
  └─ new user → JWT returned, isNewUser=true → ProfileSetupModal
               (asks: name*, class year*, pronouns, major, bio, photo,
                clubs, work experience, LinkedIn — * = required)
               → PATCH /api/users/:id saves profile, isProfileComplete=true
               → straight to gallery
```

Session persists in `sessionStorage` (clears on tab close, not browser close).

---

## 9. Demo Seed Users

All 8 users have complete profiles with avatars, bios, clubs, and work experience. Log in with any email — **no password needed**, just type the email:

| Email | Name | Department | Projects |
|---|---|---|---|
| evasquez@dartmouth.edu | Elena Vasquez | Studio Art | 3 |
| mchen@dartmouth.edu | Marcus Chen | Computer Science | 2 |
| psharma@dartmouth.edu | Priya Sharma | Environmental Studies | 3 |
| jokafor@dartmouth.edu | James Okafor | Engineering | 2 |
| srodriguez@dartmouth.edu | Sofia Rodriguez | Theater / Film | 2 |
| lpark@dartmouth.edu | Liam Park | Music / CS | 3 |
| awilliams@dartmouth.edu | Aisha Williams | Government | 2 |
| nthompson@dartmouth.edu | Noah Thompson | Biology | 3 |

---

## 10. Key Design Decisions & Constraints

- **Fonts:** Cormorant Garamond (body/UI) + Caveat (handwritten accents). Applied inline via `style={{ fontFamily: '...' }}` — not via Tailwind — to avoid purge issues.
- **Tailwind config must be `.cjs`** — the `client/` package has `"type":"module"`, which makes `.js` files ESM. Tailwind's PostCSS plugin can't load ESM configs, so `tailwind.config.cjs` with `module.exports` is required.
- **Images stored as base64** — no Cloudinary. Practical for a demo but not ideal for scale. Large uploads (>5MB) may slow down.
- **No JWT verification middleware** — routes trust the `authorId` in the request body. Fine for a demo; for production, extract userId from the JWT on every request.
- **Canvas frame positions** — `frameData.x/y` are canvas coordinates (not screen pixels). The canvas has no boundaries — you can add projects at any x/y and they'll appear wherever you pan.
- **Frame images** — `/public/frames/frame-1.png` through `frame-18.png`. These are pre-existing ornate frame PNGs. `frameIndex` in project data references these.

---

## 11. Known Issues / TODOs

- Netlify cold starts can be slow (Prisma binary + serverless = 2–4s first request)
- No JWT auth middleware — production should verify tokens server-side
- Large base64 images inflate DB size — consider Cloudinary or Supabase Storage for production
- `UserProfileModal.tsx` still exists but is no longer used (replaced by `ProfilePage.tsx`) — safe to delete
- No rate limiting on auth endpoints
- Messages have no read/unread state

---

## 12. Useful Commands

```bash
# Re-seed the database (wipes everything, re-populates)
cd server && npx ts-node prisma/seed.ts

# Push schema changes to Neon
cd server && npx prisma db push

# Open Prisma Studio (visual DB browser)
cd server && npx prisma studio

# Type-check everything
cd server && npx tsc --noEmit
cd client && npx tsc --noEmit

# Full production build (same as Netlify runs)
cd client && npm run build
```
