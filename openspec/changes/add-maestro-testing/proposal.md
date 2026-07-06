# Add Maestro E2E Testing + Web Platform Spec

## Why

The MDConverter app now runs on iOS, Android **and web** (react-native-web,
Metro bundler). We have zero automated UI tests. Before the first App Store
submission it needs a safety net that catches regressions in the core happy
path — launch, convert, copy/share — without requiring a full build server.

Maestro is the right fit: its YAML flows are readable, its device driver works
with Expo (no code changes to the app), and it runs on the same Mac used for
`npx expo run:ios` without a cloud account.

Additionally, the web/Mac platform changes shipped in commit `5c71b28` are not
yet reflected in the `file-conversion` spec.

## What Changes

### 1. Spec update
Add a "Web platform" requirement to `openspec/specs/file-conversion/spec.md`
capturing the `react-native-web` + `reader.ts` + Metro canvas stub work.

### 2. Maestro flows (`maestro/` directory)

| Flow file | What it tests |
|-----------|---------------|
| `01-launch.yaml` | Cold launch → home screen elements visible |
| `02-convert-button.yaml` | Tap "Convert to Markdown" → document picker appears |
| `03-daily-limit.yaml` | After 6 taps on convert, limit alert appears |
| `04-preview-actions.yaml` | Preview screen → Copy for AI + Share .md buttons visible |

### 3. Run instructions
Add `README-TESTING.md` explaining how to install Maestro and run the suite
against an Expo Go / simulator build.

## Non-Goals

- Cloud/CI Maestro runs (Maestro Cloud needs a paid account; left for later)
- Testing the document picker file selection itself (OS modal, not automatable
  with Maestro without an actual file on the device)
- Web/browser E2E (Playwright is a separate concern)

## Impact

- New files: `maestro/*.yaml`, `README-TESTING.md`
- Spec update: `openspec/specs/file-conversion/spec.md`
- No production code changes
