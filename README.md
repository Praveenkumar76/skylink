# SkyLink

A full‑stack social app built with Next.js App Router, TypeScript, Prisma, PostgreSQL and Supabase Storage. It includes timelines, profiles, messaging, notifications, search and an AI assistant.

## Tech Stack

- Next.js 15 (App Router) + React 18 + TypeScript
- Prisma ORM + PostgreSQL
- Supabase Storage (media uploads)
- Material UI (MUI)
- TanStack React Query
- SCSS (Sass)
- Authentication with bcrypt + jose (JWT)
- Groq AI for the chatbot

## Features

- Profiles with avatar, header, bio, website and location
- Tweets, replies, likes, retweets and share counters with optimistic updates
- Infinite scrolling feeds and “Who to follow” suggestions
- Notifications (like, retweet, follow, message, welcome)
- Direct messages with images, typing indicator and relative timestamps
- Search for users and tweets
- Light/Dark theme, accessible UI, responsive layout
- File uploads to Supabase Storage
- AI Assistant (SkyGen) with floating launcher

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database
- Optional: a Supabase project (for storage) and a Groq API key (for AI)

### 1) Install dependencies

```bash
npm install
```

### 2) Environment variables

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL=postgres://user:password@host:5432/db
DIRECT_URL=postgres://user:password@host:5432/db

# Auth/JWT (example values)
JWT_ISSUER=skylink
JWT_AUDIENCE=skylink-users
JWT_SECRET=replace_with_a_long_random_secret

# Supabase (client-side public keys for uploads)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=YOUR_PUBLIC_ANON_KEY

# Groq AI (chatbot)
GROQ_API_KEY=your_groq_api_key
```

Adjust names based on your infrastructure. Only `NEXT_PUBLIC_*` variables are exposed to the browser.

### 3) Generate Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate deploy
```

The schema is in `src/prisma/schema.prisma`. If you're developing locally, you can also run `npx prisma migrate dev`.

### 4) Start the app

```bash
npm run dev
# http://localhost:3000
```

Build and start in production:

```bash
npm run build
npm start
```

## Project Structure

- `src/app` – Next.js routes and layouts (App Router)
- `src/components` – UI components (layout, tweet, user, misc)
- `src/app/api` – API routes for tweets, users, messages, notifications, search, chatbot
- `src/prisma` – Prisma client and migrations
- `src/utilities` – helpers (auth, fetch, storage, rag)
- `src/styles` – global SCSS and resets

## Key Scripts

- `npm run dev` – start development server
- `npm run build` – build production bundle
- `npm start` – run production server
- `npm run lint` – lint with ESLint

## Deployment

This project can be deployed to any Node.js host or to Vercel. Ensure environment variables are configured in the host. For storage, set the public Supabase credentials. For the database, set `DATABASE_URL` and run migrations during deploy.

## Screenshots

![Explore](./public/screenshots/s1.png)
![Profile](./public/screenshots/s2.png)
![Chatbot](./public/screenshots/s3.png)

## Notes

- Premium demo code (for local testing): `thanksforcaring`.
- Media assets live under `public/assets`.

## License

MIT License.
