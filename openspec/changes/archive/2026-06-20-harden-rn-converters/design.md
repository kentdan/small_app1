# Design

## Context

React Native runs JavaScript on Hermes, which is not a browser: there is no
`document`, `DOMParser`, `DOMMatrix`, `Worker`, and historically no
`structuredClone`. Two libraries we depend on assume a browser/Node
environment:

- **turndown** (HTML→MD) needs a DOM. It falls back to the pure-JS
  `@mixmark-io/domino` when no native `DOMParser` exists, which *can* bundle
  in Hermes — but we should not crash the whole conversion if it fails.
- **pdfjs-dist** references `DOMMatrix`/`Path2D` (display layer) and uses
  `structuredClone`. Text extraction does not render to canvas, so stubs are
  sufficient to let the module load.

## Goals / Non-Goals

- Goal: app builds and JS bundles on iOS + Android; converters degrade
  gracefully instead of crashing.
- Non-Goal: OCR of scanned/image PDFs (not feasible purely on-device here).
- Non-Goal: pixel-perfect PDF layout reconstruction — we extract reading-order
  text grouped by line.

## Decisions

### Continuous Native Generation instead of hand-written native code
The earlier `android/` files were authored for Chaquopy and are now dead and
build-breaking. Expo can regenerate `ios/` and `android/` from `app.json`
(which already declares iOS `CFBundleDocumentTypes` for the share sheet and
the bundle identifier). Deleting them and git-ignoring the generated dirs is
simpler and avoids drift.

### Polyfill-then-lazy-require for pdfjs
`converters/polyfills.ts` installs missing globals and is imported at the top
of `pdf.ts` before `require('pdfjs-dist/...')`. pdfjs is required lazily inside
a getter so the polyfills are guaranteed to run first. `getDocument` runs with
`isEvalSupported:false`, `useSystemFonts:false`, `disableFontFace:true`.

### Defensive HTML conversion
`htmlToMarkdown` tries turndown first; on any throw it falls back to a
regex-based converter that needs no DOM. This guarantees HTML/EPUB conversion
always returns something usable.

## Risks / Trade-offs

- pdfjs runtime behaviour under Hermes can only be fully confirmed on a real
  device/simulator. Mitigation: try/catch returns a clear, user-facing error
  rather than white-screening, and the JS bundle is verified to compile.
- The regex HTML fallback is lower fidelity than turndown (acceptable as a
  safety net).
