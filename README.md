# Flashcards Vocabulary App

A polished flashcard application built with Next.js, Tailwind CSS, and an Express + MSSQL backend. Swipe through vocabulary cards, mark words as learned, filter your deck, and use text-to-speech for pronunciation.

## Features

* 🎯 Smooth Animations powered by Framer Motion
* 📱 Mobile-First Design with touch swipe gestures and responsive layouts
* 🔊 Text-to-Speech for term or example sentence via Web Speech API
* 👆 Swipe Gestures: swipe right for next, left for previous
* 🌓 Dark/Light Mode toggle
* ⚙️ Learning Tracker: mark words as learned (persists to database)
* 🗂 Filters: All / Öğrendiklerim / Öğrenmediklerim

## Tech Stack

Next.js 15 (App Router), React 18+, TypeScript, Tailwind CSS, Framer Motion, Lucide React (icons), Express.js + mssql, SQL Server

## Project Structure

```
/
├─ backend/
│  ├─ db.js               # MSSQL pool & dotenv config
│  ├─ index.js            # Express server mounting /api/words
│  └─ routes/words.js     # GET /api/words, GET /api/words/:id, POST /api/words/:id/learn
├─ app/ or pages/         # Next.js app router (FlashcardViewer, etc.)
├─ components/            # FlashcardViewer.tsx, ProgressCircle.tsx, ThemeToggle.tsx
├─ contexts/FlashcardContext.tsx
├─ hooks/use-speech.ts, use-swipe.ts
├─ next.config.js         # Next.js config & rewrites
├─ vercel.json            # Vercel routing for Express + Next.js
├─ .env                   # NEXT_PUBLIC_API_URL, MSSQL_CONNECTION_STRING
└─ package.json
```

## Getting Started Locally

1. Clone & install

   ```
   git clone https://github.com/enesscigdem/flashcards-vocabulary-next-tailwind-nodejs.git
   cd flashcards-vocabulary-next-tailwind-nodejs
   pnpm install
   ```
2. Configure environment
   Copy `.env.example` → `.env` and set:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   MSSQL_CONNECTION_STRING="Server=<HOST>,1433;Database=<DB>;User Id=<USER>;Password=<PASS>;TrustServerCertificate=true;"
   ```
3. Run backend + frontend

   ```
   node backend/index.js      # start Express + MSSQL
   pnpm dev                   # start Next.js
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## Deployment on Vercel

1. Rename `next.config.mjs` → `next.config.js` and ensure rewrites route `/api` to your Express handler.

2. Add `vercel.json`:

   ```json
   {
     "version": 2,
     "builds": [
       { "src": "backend/index.js", "use": "@vercel/node" },
       { "src": "package.json",    "use": "@vercel/next" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/backend/index.js" },
       { "src": "/(.*)",     "dest": "/$1" }
     ]
   }
   ```

3. In Vercel dashboard set env vars:

   ```
   NEXT_PUBLIC_API_URL=https://<your-vercel-app>
   MSSQL_CONNECTION_STRING=<your-connection-string>
   ```

4. Push to GitHub; Vercel deploys both backend functions and Next.js frontend.

## Backend API

* **GET** `/api/words` — list all flashcards
* **GET** `/api/words/:id` — get a single flashcard
* **POST** `/api/words/:id/learn` — mark word as learned (returns `204 No Content`)
