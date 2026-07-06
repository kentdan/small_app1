# Add Local Library for Converted Files

## Why

Today a conversion result exists only while the preview screen is open — go
back and it's gone. Users have to re-convert the same file (burning their
daily limit) just to copy it again. There is no way to see, reopen, or delete
past conversions.

## What Changes

### 1. Persistent local library (`lib/library.ts`)
Every successful conversion is saved **on-device only**:
- **Native**: markdown written to `FileSystem.documentDirectory/library/<id>.md`
- **Web**: markdown stored in AsyncStorage (localStorage)
- A lightweight index (id, name, date, size, snippet) lives in AsyncStorage

### 2. Home screen becomes the library
- Header: app name + daily counter
- Primary CTA: "Convert to Markdown"
- Below: list of saved conversions (name, snippet, date, size)
- Tap a row → reopen in preview; long-press → delete (with confirm)
- Empty state explains files are stored locally

### 3. Preview loads by id
Markdown is no longer passed through router params (fragile for large files).
Preview receives `id` and loads content from the library. A `markdown` param
fallback remains for the Maestro deep-link flow.

### 4. Web-safe dialogs (`lib/notify.ts`)
RN `Alert.alert` is a no-op on web. A tiny helper uses `window.alert` /
`window.confirm` on web, native Alert elsewhere.

## Non-Goals

- Cloud sync / backup (explicitly local-only)
- Folders, tags, search (flat reverse-chronological list is enough)
- Editing markdown in-app

## Impact

- New: `lib/library.ts`, `lib/notify.ts`, `hooks/useLibrary.ts`
- Rewritten: `app/index.tsx`, `app/preview.tsx`; updated `app/converting.tsx`
- New spec: `openspec/specs/library/spec.md`
- Maestro flows updated to new copy
