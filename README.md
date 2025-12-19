# 🎅 Secret Santa

A beautiful, shareable Secret Santa gift exchange app built with Next.js, TypeScript, and Supabase.

## Features

- **Create Events** - Start a Secret Santa event with a unique shareable link
- **Join via Link** - Participants join by entering their name (no login required)
- **Fair Assignments** - Server-side assignment generation ensures fairness
- **Wishlists** - Participants can add wishlist items visible to their Secret Santa
- **Role Separation** - Event creators have admin controls; participants see only their assignment
- **Real-time Sync** - State persists across devices and sessions

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Custom winter theme with snowfall animation

---

## Getting Started

### 1. Set up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run the schema from `supabase-schema.sql`
4. Go to **Settings > API** and copy your:
   - Project URL
   - `anon` public key

### 2. Configure Environment

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
├─────────────────────────────────────────────────────────────┤
│  Home Page → Create Event Page → Event Page (shareable)     │
│       ↓              ↓                  ↓                   │
│    /            /event           /event/[eventId]           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    Server Actions
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                    │
├─────────────────────────────────────────────────────────────┤
│  events │ participants │ assignments │ wishlists            │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

| Table | Description |
|-------|-------------|
| `events` | Stores event details + admin token |
| `participants` | People who joined an event |
| `assignments` | Who buys for whom (giver → receiver) |
| `wishlists` | Items participants want to receive |

### Role System

- **Admin** (event creator): Stored admin token in localStorage. Can generate assignments, reset event.
- **Participant**: Stored participant ID in localStorage. Can view their assignment and manage their wishlist.

---

## API Reference (Server Actions)

| Action | Description |
|--------|-------------|
| `createEvent(name?)` | Create a new event |
| `getEventData(eventId)` | Get event + participants |
| `addParticipant(eventId, name)` | Join an event |
| `generateAssignments(eventId, adminToken)` | Generate & lock assignments |
| `getMyAssignment(eventId, participantId)` | Get a participant's assignment |
| `getWishlist(participantId)` | Get wishlist items |
| `addWishlistItem(participantId, item)` | Add to wishlist |
| `resetEvent(eventId, adminToken)` | Reset entire event |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

The app will work across devices with the shareable event links.

---

## License

MIT
