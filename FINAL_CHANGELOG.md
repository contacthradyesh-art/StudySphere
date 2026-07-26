# StudySphere Engineering Merge Changelog

## [1.0.0-merged] - 2026-07-26

### Added
- **Gemini AI Integration**: Added `@google/generative-ai` dependency and `src/lib/ai/gemini.ts` along with `src/features/ai/components/DoubtSolverContent.tsx`.
- **Mock Tests Engine**: Integrated `src/features/mock-tests/` (`MockTestContent`, `TestCard`, `TestInterface`, `TestResultView`, `testCalculations`), `stores/useMockTestStore.ts`, and `lib/repositories/mockTestRepository.ts`.
- **Analytics & Syllabus**: Integrated `src/features/analytics/` (`AnalyticsContent`, `mockAnalyticsData`) and `src/features/syllabus/` (`SyllabusContent`, `mockSyllabusData`).
- **Wellbeing Module**: Integrated `src/features/wellbeing/` (`WellbeingContent`, `mockWellbeingData`).
- **Exam Readiness & Overlap Cards**: Added `ExamOverlapCard`, `MistakeNotebookCard`, `ReadinessScoreCard`, `WeakTopicsCard`, `TodaysOneThingCard` to Dashboard widgets.
- **Repository Architecture**: Added complete data access layer in `src/lib/repositories/` (`analyticsRepository`, `flashcardRepository`, `journalRepository`, `mockTestRepository`, `plannerRepository`, `syllabusRepository`, `userRepository`, `wellbeingRepository`).
- **Shared Design System Primitives**: Added `BottomSheet`, `Charts`, `Dialog`, `ProgressRing`, `ProgressBar`, `SkeletonLoader`, `Tabs`, `Toast`, `icons` in `src/components/shared/`.
- **Core Types, Utilities & Styles**: Added `src/types/` (`api.ts`, `common.ts`, `exam.ts`, `user.ts`), `src/utils/` (`cn.ts`, `constants.ts`, `formatters.ts`, `getCurrentUserId.ts`, `validators.ts`), and `src/styles/tokens.ts`.
- **Navigation Shortcuts**: Updated main `Sidebar` navigation to include Mock Tests, AI Doubt Solver, Analytics, Syllabus, and Wellbeing pages.

### Fixed
- Fixed WebCrypto `Uint8Array` to `BufferSource` type casting error in `src/lib/journal/journal-crypto.ts` for Web Crypto API compatibility.
- Fixed Firebase client `setPersistence` SSR error by wrapping execution in `typeof window !== 'undefined'` guard.
- Fixed Firebase Admin initialization by adding project_id validation before invoking `cert()`.
- Added environment variable fallbacks in `src/lib/firebase/client.ts` and `src/lib/firebase/config.ts` to allow static page prerendering during Next.js production build (`npm run build`).
- Resolved Next.js 16 deprecated `eslint` key in `next.config.mjs`.

### Verified
- `npm install --legacy-peer-deps` passed cleanly.
- `npx tsc --noEmit` passed cleanly with zero errors.
- `npm run build` completed successfully with all 29 static routes prerendered.
