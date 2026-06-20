# Design

## Maestro Overview

Maestro is a declarative mobile UI test framework. Tests are YAML files called
"flows". The Maestro CLI drives the simulator / device over the iOS
Accessibility API (or Android UIAutomator) — no WebDriver, no Appium, no code
changes to the app.

```
┌──────────────────────────────────────────────────────┐
│                  MAESTRO TEST ARCHITECTURE           │
├──────────────────────────────────────────────────────┤
│                                                      │
│   maestro/          ←  YAML flows (this PR)          │
│   ├── 01-launch.yaml                                 │
│   ├── 02-convert-button.yaml                         │
│   ├── 03-daily-limit.yaml                            │
│   └── 04-preview-actions.yaml                        │
│                                                      │
│   Maestro CLI  ──drives──▶  iOS Simulator            │
│        │                   (com.mdconverter)         │
│        │                         │                   │
│        ▼                         ▼                   │
│   assertions                 app under test          │
│   (assertVisible,            (Expo / React Native)   │
│    assertNotVisible,                                 │
│    tapOn, inputText…)                                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## App ID

`com.mdconverter` — matches `expo.ios.bundleIdentifier` and
`expo.android.package` in `app.json`.

## What Is Testable

Maestro can only interact with what is rendered in the Accessibility tree.

| Scenario | Testable? | Notes |
|----------|-----------|-------|
| Home screen renders | ✅ | assertVisible on button label |
| Tap "Convert to Markdown" | ✅ | document picker appears (OS sheet) |
| Document picker itself | ❌ | OS modal, outside app's a11y tree |
| Daily limit counter text | ✅ | "0 / 5 free conversions today" |
| Daily limit alert | ✅ | launchApp with injected AsyncStorage state via env |
| Preview screen buttons | ✅ | navigate via deep link |
| Clipboard copy | ✅ (partial) | tap the button; assertVisible toast |
| File share sheet | ❌ | OS modal |

## Seeding State for the Daily Limit Test

To test the "6th conversion shows alert" path without actually converting 5
files, we use Maestro's `clearState` + `launchApp` with `--env` to inject a
pre-seeded AsyncStorage key. The app reads `mdconverter_usage` from
AsyncStorage on boot; we set it to `{ date: today, count: 5, isPremium: false }`
via a debug deep link route `/seed?count=5`.

> **Note**: The seed route `/seed` is a minimal debug screen (one `useEffect`
> that writes to AsyncStorage and immediately redirects to `/`). It is
> compiled out in production via `__DEV__` guard or left harmless since it
> requires explicit navigation.

## Deep Link Navigation for Preview Screen

The preview screen expects `{ fileName, markdown }` search params. We can
navigate directly:

```
mdconverter:///preview?fileName=test.pdf&markdown=Hello%20World
```

Maestro's `openLink` action drives this without needing a real conversion.

## Flow Structure

Each flow file:
1. `appId: com.mdconverter`
2. `---`
3. Setup (`clearState` or `launchApp`)
4. Assertions / interactions
5. Final assertion to confirm expected state

## Risks

- **Simulator required**: Maestro does not run against Expo Go (JS bundle
  only). The sim must be built with `npx expo run:ios`. Documented in README.
- **Timing**: React Native's JS thread can be slow on first render. Flows use
  `extendedWaitUntil` / default 5 s timeout.
- **Deep link seed route**: adds a tiny amount of code (the `/seed` screen).
  Guard it with `if (__DEV__)` so it strips from production bundle.
