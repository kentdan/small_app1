# Harden React Native converters for on-device use

## Why

The app was pivoted from a Chaquopy/Python (Android-only) design to pure
JavaScript converters so it can run on **iOS and Android**. An audit revealed
several issues that would prevent it from building or running on a real
device/simulator:

1. `package.json` pinned `react@18.3.2`, which does not exist — `npm install`
   failed with `ERESOLVE` / `react@undefined`.
2. The hand-written `android/` project and `modules/MarkItDownModule/` still
   referenced the deleted Chaquopy `MarkItDownPackage`, which would break the
   Android build.
3. `converters/html.ts` used `turndown`, and `converters/pdf.ts` used
   `pdfjs-dist`; both reference browser/DOM globals that Hermes (React Native's
   engine) does not provide, risking runtime crashes.
4. `converters/index.ts` used a dynamic `import()` that failed TypeScript
   compilation under the project's module setting.

We cannot run Xcode here (Linux container), but we can — and did — verify the
JavaScript end-to-end: TypeScript typecheck and a full Metro bundle for iOS.

## What Changes

- Fix `react` to `18.3.1` (matches React Native 0.76.5).
- Delete the hand-written `android/` and `modules/` directories; rely on Expo
  Continuous Native Generation (`expo prebuild`) to produce native projects
  from `app.json`. Ignore `/ios/` and `/android/` in git.
- Add `converters/polyfills.ts` (`structuredClone`, `Promise.withResolvers`,
  `DOMMatrix` stub) imported before `pdfjs-dist` loads.
- Harden `converters/pdf.ts`: lazy-load pdfjs, disable eval/system fonts, wrap
  in `try/catch` with a clear message, and handle scanned/no-text PDFs.
- Harden `converters/html.ts`: lazy turndown with a dependency-free regex
  fallback if the DOM shim fails.
- Replace the dynamic import in `converters/index.ts` with a static import.

## Impact

- Affected specs: `file-conversion`
- Affected code: `package.json`, `.gitignore`, `converters/*`, removal of
  `android/` and `modules/`
- Verification: `tsc --noEmit` passes; `expo export --platform ios` bundles
  1065 modules to Hermes bytecode with exit 0.
