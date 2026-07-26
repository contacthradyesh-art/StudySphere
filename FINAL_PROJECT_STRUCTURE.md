# Final Project Structure - StudySphere Merged

```
studysphere-main/
├── .eslintrc.json
├── .gitignore
├── .env.example
├── components.json
├── firestore.rules
├── storage.rules
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── FINAL_MERGE_REPORT.md
├── FINAL_PROJECT_STRUCTURE.md
├── FINAL_CHANGELOG.md
├── public/
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   └── forgot-password/page.tsx
    │   ├── (dashboard)/
    │   │   ├── layout.tsx
    │   │   └── dashboard/
    │   │       ├── page.tsx
    │   │       ├── achievements/page.tsx
    │   │       ├── ai/page.tsx
    │   │       ├── analytics/page.tsx
    │   │       ├── assistant/page.tsx
    │   │       ├── bushido/page.tsx
    │   │       ├── flashcards/
    │   │       │   ├── page.tsx
    │   │       │   └── [deckId]/page.tsx
    │   │       ├── focus/page.tsx
    │   │       ├── growth-os/page.tsx
    │   │       ├── journal/
    │   │       │   ├── page.tsx
    │   │       │   └── [id]/page.tsx
    │   │       ├── mock-tests/page.tsx
    │   │       ├── notes/
    │   │       │   ├── page.tsx
    │   │       │   └── [id]/page.tsx
    │   │       ├── planner/page.tsx
    │   │       ├── pomodoro/page.tsx
    │   │       ├── subjects/
    │   │       │   ├── page.tsx
    │   │       │   └── [subject]/page.tsx
    │   │       ├── syllabus/page.tsx
    │   │       └── wellbeing/page.tsx
    │   ├── (main)/
    │   │   ├── ai/page.tsx
    │   │   ├── analytics/page.tsx
    │   │   ├── mock-tests/page.tsx
    │   │   ├── syllabus/page.tsx
    │   │   └── wellbeing/page.tsx
    │   ├── api/
    │   │   ├── ai/chat/route.ts
    │   │   └── auth/session/route.ts
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── loading.tsx
    ├── components/
    │   ├── ai/
    │   ├── dashboard/
    │   ├── flashcards/
    │   ├── focus/
    │   ├── journal/
    │   ├── layout/
    │   │   ├── sidebar.tsx
    │   │   ├── topbar.tsx
    │   │   └── bottom-nav.tsx
    │   ├── notes/
    │   ├── planner/
    │   ├── pomodoro/
    │   ├── shared/
    │   │   ├── Badge.tsx
    │   │   ├── BottomSheet.tsx
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Charts.tsx
    │   │   ├── Dialog.tsx
    │   │   ├── Input.tsx
    │   │   ├── Modal.tsx
    │   │   ├── ProgressBar.tsx
    │   │   ├── ProgressRing.tsx
    │   │   ├── SkeletonLoader.tsx
    │   │   ├── Tabs.tsx
    │   │   ├── Toast.tsx
    │   │   ├── glass-card.tsx
    │   │   ├── icons.tsx
    │   │   ├── stat-card.tsx
    │   │   ├── theme-toggle.tsx
    │   │   └── xp-badge.tsx
    │   ├── subjects/
    │   └── ui/
    ├── features/
    │   ├── ai/
    │   ├── analytics/
    │   ├── dashboard/
    │   ├── flashcards/
    │   ├── journal/
    │   ├── mock-tests/
    │   ├── planner/
    │   ├── syllabus/
    │   └── wellbeing/
    ├── hooks/
    │   ├── use-auth.tsx
    │   ├── use-dashboard-stats.ts
    │   ├── use-decks.ts
    │   ├── use-focus-shield-state.ts
    │   ├── use-gamification.tsx
    │   ├── use-habit-insights.ts
    │   ├── use-habits.ts
    │   ├── use-journal.ts
    │   ├── use-lifegoal-insights.ts
    │   ├── use-lifegoals.ts
    │   ├── use-notes.ts
    │   ├── use-planner-insights.ts
    │   ├── use-planner-plans.ts
    │   ├── use-pomodoro.ts
    │   ├── use-sessions.ts
    │   ├── use-tasks.ts
    │   └── useMediaQuery.ts
    ├── lib/
    │   ├── ai/
    │   │   ├── ai-client.ts
    │   │   ├── fallback.ts
    │   │   └── gemini.ts
    │   ├── firebase/
    │   │   ├── admin.ts
    │   │   ├── client.ts
    │   │   ├── config.ts
    │   │   ├── firestore.ts
    │   │   ├── storage.ts
    │   │   └── storage-service.ts
    │   ├── firestore/
    │   ├── flashcards/
    │   ├── focus/
    │   ├── gamification/
    │   ├── habits/
    │   ├── journal/
    │   ├── lifegoals/
    │   ├── notes/
    │   ├── notifications/
    │   ├── planner/
    │   ├── pomodoro/
    │   └── repositories/
    │       ├── analyticsRepository.ts
    │       ├── flashcardRepository.ts
    │       ├── journalRepository.ts
    │       ├── mockTestRepository.ts
    │       ├── plannerRepository.ts
    │       ├── syllabusRepository.ts
    │       ├── userRepository.ts
    │       └── wellbeingRepository.ts
    ├── store/ & stores/
    │   ├── flashcard-store.ts
    │   ├── habit-store.ts
    │   ├── journal-store.ts
    │   ├── lifegoal-store.ts
    │   ├── notes-store.ts
    │   ├── planner-store.ts
    │   ├── pomodoro-store.ts
    │   ├── useMockTestStore.ts
    │   ├── useNavigationStore.ts
    │   ├── useThemeStore.ts
    │   └── useUserStore.ts
    ├── styles/
    │   └── tokens.ts
    ├── types/
    │   ├── api.ts
    │   ├── common.ts
    │   ├── exam.ts
    │   └── user.ts
    └── utils/
        ├── cn.ts
        ├── constants.ts
        ├── formatters.ts
        ├── getCurrentUserId.ts
        └── validators.ts
```
