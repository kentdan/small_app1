# Tasks

## 1. Dependencies & build hygiene
- [x] 1.1 Fix `react` version `18.3.2` → `18.3.1` in `package.json`
- [x] 1.2 `npm install --legacy-peer-deps` succeeds (929 packages)
- [x] 1.3 Delete hand-written `android/` and `modules/MarkItDownModule/`
- [x] 1.4 Git-ignore generated `/ios/` and `/android/`

## 2. Converter compatibility
- [x] 2.1 Add `converters/polyfills.ts` (structuredClone, Promise.withResolvers, DOMMatrix)
- [x] 2.2 Harden `converters/pdf.ts` (lazy load, polyfills first, try/catch, empty-text handling)
- [x] 2.3 Harden `converters/html.ts` (lazy turndown + regex fallback)
- [x] 2.4 Replace dynamic `import()` in `converters/index.ts` with static import

## 3. Verification (without Xcode)
- [x] 3.1 `npx tsc --noEmit` passes with no errors
- [x] 3.2 `npx expo export --platform ios` bundles all modules to Hermes bytecode (exit 0)

## 4. On a Mac (follow-up, requires Xcode + Apple dev account)
- [ ] 4.1 `npx expo prebuild` to generate native projects
- [ ] 4.2 `npx expo run:ios` and convert a sample PDF/DOCX/XLSX in the Simulator
- [ ] 4.3 Verify the app appears in the iOS share sheet for supported types
- [ ] 4.4 Create IAP product `com.mdconverter.pro` and test purchase/restore
