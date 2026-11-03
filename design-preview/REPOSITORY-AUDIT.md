# StudySphere repository audit (2026-11-03)

## Verified repository state
- Repository: contacthradyesh-art/StudySphere
- Default branch: main
- Audited base commit: ebe78ab650ac92f2fd609ef87063b033a8b6b1bb
- Framework: Next.js App Router; package manifest currently resolves Next.js ^16.2.9 and React 19 (prompt's Next.js 14+ requirement is satisfied by version range but not specifically pinned to 14).
- TypeScript, Tailwind CSS, Firebase client/admin SDKs, Capacitor Android, Vercel and GitHub Actions are present.
- Total tracked files in recursive tree: 423.
- App Router page files: 60.

## Route inventory
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/mission-ias-lock/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(dashboard)/dashboard/achievements/page.tsx`
- `src/app/(dashboard)/dashboard/ai/page.tsx`
- `src/app/(dashboard)/dashboard/analytics/page.tsx`
- `src/app/(dashboard)/dashboard/assistant/page.tsx`
- `src/app/(dashboard)/dashboard/community/[roomId]/page.tsx`
- `src/app/(dashboard)/dashboard/community/discover/page.tsx`
- `src/app/(dashboard)/dashboard/community/following/page.tsx`
- `src/app/(dashboard)/dashboard/community/leaderboard/page.tsx`
- `src/app/(dashboard)/dashboard/community/manage/page.tsx`
- `src/app/(dashboard)/dashboard/community/notifications/page.tsx`
- `src/app/(dashboard)/dashboard/community/page.tsx`
- `src/app/(dashboard)/dashboard/community/profile/page.tsx`
- `src/app/(dashboard)/dashboard/community/student/[uid]/page.tsx`
- `src/app/(dashboard)/dashboard/english-lab/page.tsx`
- `src/app/(dashboard)/dashboard/flashcards/[deckId]/page.tsx`
- `src/app/(dashboard)/dashboard/flashcards/page.tsx`
- `src/app/(dashboard)/dashboard/focus/page.tsx`
- `src/app/(dashboard)/dashboard/journal/[id]/page.tsx`
- `src/app/(dashboard)/dashboard/journal/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/bookmarks/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/budget-economy/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/current-affairs/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/daily-answer-writing/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/digital-library/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/editorial-hub/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/environment-hub/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/essay-lab/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/ethics-lab/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/government-schemes/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/international-relations/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/interview-room/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/knowledge-graph/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/map-practice/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/mission-analytics/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/motivation/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/pib-hub/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/prelims-test-engine/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/prs-hub/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/pyq-explorer/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/reports-indices/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/revision-engine/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/science-tech/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/upscr-os/page.tsx`
- `src/app/(dashboard)/dashboard/mission-ias/vocabulary-lab/page.tsx`
- `src/app/(dashboard)/dashboard/mock-tests/page.tsx`
- `src/app/(dashboard)/dashboard/notes/[id]/page.tsx`
- `src/app/(dashboard)/dashboard/notes/page.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/dashboard/planner/page.tsx`
- `src/app/(dashboard)/dashboard/pomodoro/page.tsx`
- `src/app/(dashboard)/dashboard/psychology-lab/page.tsx`
- `src/app/(dashboard)/dashboard/settings/page.tsx`
- `src/app/(dashboard)/dashboard/syllabus/page.tsx`
- `src/app/(dashboard)/dashboard/wellbeing/page.tsx`
- `src/app/page.tsx`

## Notes / caveats
- A route file's existence does not prove its UI or backend interactions are complete. Individual routes and controls still need browser-level QA.
- The README's roadmap is stale relative to current code. Verify feature status from implementation, not README claims.
- Android implementation includes Focus Shield Accessibility Service, MainActivity, reminder receivers and manifest configuration. Browser preview cannot validate Android permissions or app-blocking behavior.
- `android/app/debug.keystore.b64` appears as a tracked file. Treat as a security hygiene issue: determine whether it is a throwaway debug signing key, rotate/remove from source history if appropriate, and never publish/reuse a production signing key.
- Existing Firebase data and core user content are out of scope for destructive changes.
- Open PR #44 remains a separate Android bridge fix and is not part of this visual prototype.

## Next implementation gate
1. Review this prototype in a browser at desktop and mobile widths.
2. Confirm design direction and navigation priorities.
3. Map each real route's current behavior to the new screen.
4. Implement in small feature groups, preserving Firebase schemas and auth boundaries.
5. Run typecheck, lint, production build, route smoke tests, PWA checks and Android build/device tests.
6. Merge only after checks pass; deploy to production only after preview validation.
