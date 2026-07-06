# file-conversion Specification

## Purpose
TBD - created by archiving change harden-rn-converters. Update Purpose after archive.
## Requirements
### Requirement: On-device conversion runs on iOS and Android
The app SHALL convert supported files to Markdown using only JavaScript that
runs on the React Native (Hermes) engine, with no Python runtime and no
server, on both iOS and Android.

#### Scenario: JavaScript bundle builds for iOS
- **WHEN** the project is bundled with Metro for iOS
- **THEN** all converter modules resolve and compile to Hermes bytecode
  without errors

#### Scenario: No native Python dependency
- **WHEN** the repository is inspected
- **THEN** no Chaquopy/MarkItDown native module or Python source is required
  for conversion

### Requirement: Converters run on web (react-native-web / Metro)
The app SHALL bundle and run in a web browser via `react-native-web` without
importing `expo-file-system` directly in any converter module.

#### Scenario: Web bundle compiles without native file-system calls
- **WHEN** the project is exported with `expo export --platform web`
- **THEN** Metro produces a complete static bundle (all 5 routes) with no
  unresolved native modules

#### Scenario: Web file reading uses fetch on blob URIs
- **WHEN** a file is picked on web (blob:// URI from document picker)
- **THEN** `converters/reader.ts` reads it via `fetch()` and returns base64
  or text without calling any expo-file-system API

#### Scenario: pdfjs canvas stub on web
- **WHEN** pdfjs-dist legacy build is included in the web bundle
- **THEN** Metro resolves `require('canvas')` to an empty module (native
  `DOMMatrix` is available in the browser) and the bundle compiles without error

### Requirement: Converters degrade gracefully under Hermes
Converters that depend on browser/DOM globals SHALL provide polyfills or
fallbacks so that a missing global produces a clear result rather than an
application crash.

#### Scenario: PDF cannot be parsed on-device
- **WHEN** a PDF fails to load or contains no selectable text
- **THEN** the converter returns a clear message (e.g. encrypted, or
  scanned/image-only) instead of throwing an unhandled error

#### Scenario: HTML DOM shim unavailable
- **WHEN** the turndown DOM shim fails to initialise
- **THEN** the app falls back to a dependency-free HTML→Markdown conversion
  and still returns Markdown

