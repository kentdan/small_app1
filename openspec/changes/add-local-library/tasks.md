# Tasks

## 1. Storage layer
- [x] 1.1 `lib/library.ts` — save/list/get/delete, platform-aware content storage
- [x] 1.2 `lib/notify.ts` — web-safe alert/confirm helpers
- [x] 1.3 `hooks/useLibrary.ts` — focus-aware hook over the library

## 2. Screens
- [x] 2.1 Rewrite `app/index.tsx` — CTA + library list, empty state, long-press delete
- [x] 2.2 Rewrite `app/preview.tsx` — load content by id (markdown param fallback)
- [x] 2.3 Update `app/converting.tsx` — save to library, route with id

## 3. Spec & tests
- [x] 3.1 New `openspec/specs/library/spec.md`
- [x] 3.2 Update Maestro flows for new copy
- [x] 3.3 `npx tsc --noEmit` clean
- [x] 3.4 Web bundle + Playwright screenshots (empty home, library list, preview from library)

## 4. Git
- [x] 4.1 Commit and push
