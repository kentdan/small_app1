# MDConverter

Convert any file to Markdown, entirely on-device. Works on **iOS and Android** — no server, no internet, no Python runtime required.

## How to use

**Option 1 — Share sheet (recommended on iPhone)**
1. Open any file in Files, Mail, Safari, or any other app
2. Tap the Share button (or long-press)
3. Choose **MDConverter** from the share sheet
4. The file is converted instantly and shown in the preview

**Option 2 — Pick a file from within the app**
1. Open MDConverter
2. Tap **Convert to Markdown**
3. Select a file from your device or iCloud

## Supported formats (iOS and Android)

| Format | Converter |
|--------|-----------|
| PDF | pdfjs-dist — text extraction per page |
| DOCX | jszip + XML parser — preserves headings, bold, italic, lists |
| PPTX | jszip + XML parser — extracts text per slide |
| XLSX | SheetJS — each sheet becomes a markdown table |
| HTML | turndown.js — full semantic conversion |
| CSV | Custom parser — proper quoted-field handling |
| JSON | Pretty-prints as fenced code block |
| XML | Fenced code block |
| TXT | Plain text passthrough |
| EPUB | jszip + HTML extraction from XHTML chapters |

## Architecture

All conversion is pure JavaScript/TypeScript — no native modules, no Python.

```
Share button / File picker
        │
        ▼
converters/index.ts  (dispatcher, picks converter by MIME type)
        │
        ├── converters/pdf.ts    (pdfjs-dist, text extraction)
        ├── converters/docx.ts   (jszip + XML)
        ├── converters/pptx.ts   (jszip + XML per slide)
        ├── converters/xlsx.ts   (SheetJS)
        ├── converters/html.ts   (turndown.js)
        └── converters/text.ts   (CSV, JSON, XML, plain text)
        │
        ▼
Preview screen — rendered markdown, token counter, Copy for AI, Share .md
```

## Tech stack

| Layer | Tech |
|-------|------|
| UI | Expo 52 + Expo Router + TypeScript |
| Share/Open with | iOS CFBundleDocumentTypes + Android intent-filter |
| File picker | expo-document-picker |
| PDF | pdfjs-dist (legacy build, worker disabled) |
| DOCX / PPTX / EPUB | jszip + custom XML parser |
| XLSX | SheetJS (xlsx) |
| HTML | turndown.js |
| Sharing output | expo-sharing + expo-clipboard |
| Usage tracking | @react-native-async-storage/async-storage |
| In-app purchase | react-native-iap |

## Setup

```bash
npm install
npx expo run:ios     # requires Xcode on Mac + Apple dev account
npx expo run:android
```

## Freemium

- Free: 5 conversions/day (resets at midnight)
- Pro: unlimited — $2.99 one-time

Before submitting, create product ID `com.mdconverter.pro` (Non-Consumable) in:
- App Store Connect → your app → In-App Purchases
- Google Play Console → your app → In-app products
