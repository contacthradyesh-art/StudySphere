# StudySphere

AI-powered student productivity platform: planner, Pomodoro, Focus Shield, notes,
flashcards, journal, AI assistant and exam prep, unified in one app.

## Tech stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn UI** (glassmorphism design system)
- **Framer Motion** animations
- **Firebase** Authentication, Firestore, Storage
- **Zustand** state, **next-themes** dark/light mode
- **Vercel** deployment

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Firebase keys
npm run dev
```

Open http://localhost:3000

## Project structure

```
src/
  app/
    (auth)/        login, register, forgot-password
    (dashboard)/   protected app shell + dashboard
    api/auth/      session cookie endpoint
  components/      ui (shadcn), layout, shared
  hooks/           useAuth
  lib/             firebase, auth, firestore schema, validators, utils
  middleware.ts    protected-route guard
firestore.rules    Firestore security rules
storage.rules      Storage security rules
```

## Roadmap

1. **M1 - Setup + Auth + Dashboard** (current)
2. M2 - Smart Study Planner
3. M3 - Pomodoro + Focus Shield
4. M4 - Notes + Subjects
5. M5 - Diary & Journal
6. M6 - AI Assistant + Flashcards
7. M7 - Exam Prep + Analytics
8. M8 - Gamification + Premium (PWA)

## Firebase setup

1. Create a Firebase project, enable **Email/Password** and **Google** auth providers.
2. Create a **Firestore** database and a **Storage** bucket.
3. Deploy rules: `firebase deploy --only firestore:rules,storage`
4. Generate a service account for the Admin SDK and set `FIREBASE_*` server vars.
