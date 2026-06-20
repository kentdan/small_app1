# Tasks

## 1. Spec sync
- [ ] 1.1 Add "Web platform" requirement + scenarios to
      `openspec/specs/file-conversion/spec.md`

## 2. Debug seed route
- [ ] 2.1 Create `app/seed.tsx` — DEV-only screen that writes
      `mdconverter_usage` to AsyncStorage then redirects to `/`
- [ ] 2.2 Verify `npx tsc --noEmit` still passes

## 3. Maestro flows
- [ ] 3.1 Create `maestro/01-launch.yaml` — cold launch, home screen visible
- [ ] 3.2 Create `maestro/02-convert-button.yaml` — tap convert, picker appears
- [ ] 3.3 Create `maestro/03-daily-limit.yaml` — seed count=5, tap convert,
      assert limit alert
- [ ] 3.4 Create `maestro/04-preview-actions.yaml` — open via deep link, assert
      Copy + Share buttons visible

## 4. Documentation
- [ ] 4.1 Create `README-TESTING.md` — install Maestro, build sim, run flows

## 5. Git
- [ ] 5.1 Commit all new files with message "Add Maestro E2E flows and web spec"
- [ ] 5.2 Push to `claude/markdown-converter-react-native-fIKTn`
