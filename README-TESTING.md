# Running Maestro E2E Tests

## Prerequisites

1. **macOS** with Xcode installed (iOS Simulator required)
2. **Maestro CLI** — install once:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```
3. **App built for simulator** (Expo Go is not supported — you need a full native build):
   ```bash
   npx expo prebuild          # generate ios/ android/ from app.json
   npx expo run:ios           # build and launch in Simulator
   ```
   The simulator must remain open while tests run.

## Running All Flows

```bash
maestro test maestro/
```

## Running a Single Flow

```bash
maestro test maestro/01-launch.yaml
```

## Flow Descriptions

| File | What it tests |
|------|---------------|
| `01-launch.yaml` | Cold launch → home screen renders, no errors |
| `02-convert-button.yaml` | Tap "Convert to Markdown" → document picker opens and dismiss works |
| `03-daily-limit.yaml` | Seeds count=5 via deep link, taps convert, asserts limit alert |
| `04-preview-actions.yaml` | Navigates to preview via deep link, tests Copy/Share/Raw toggle |

## How State Seeding Works

Flow `03` uses the `/seed` route (DEV only) to write a pre-filled
`mdconverter_usage` record into AsyncStorage before the test starts:

```
mdconverter:///seed?count=5&isPremium=false
```

This lets us test the daily limit alert without actually performing 5 real
conversions. The route is compiled out of production builds (`__DEV__` guard).

## Tips

- If the simulator is slow, increase `extendedWaitUntil` timeouts in the YAML.
- Run `maestro studio` for an interactive flow recorder.
- Maestro Cloud (`maestro cloud`) can run flows in CI — requires a paid account.
