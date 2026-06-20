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

