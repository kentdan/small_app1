# MDConverter

A React Native app that converts files to Markdown **entirely on-device** using Microsoft's [MarkItDown](https://github.com/microsoft/markitdown) Python library.

## Features

- **On-device processing** — no uploads, no internet required
- **Wide format support** (Android): PDF, DOCX, PPTX, XLSX, images, HTML, CSV, JSON, XML, EPUB
- **Freemium model** — 5 free conversions/day, upgrade to Pro for unlimited
- **Markdown preview** — rendered or raw view, copy to clipboard, share as `.md`

## How it works

```
User picks file
      │
      ▼
expo-document-picker  →  copies to app cache
      │
      ▼  (Android)
MarkItDownModule (NativeModule)
      │
      ▼
Chaquopy (Python runtime embedded in APK)
      │
      ▼
MarkItDown library  →  returns Markdown string
      │
      ▼
Preview screen (react-native-markdown-display)
```

## Tech stack

| Layer | Tech |
|-------|------|
| UI | Expo 52 + Expo Router + TypeScript |
| File picker | expo-document-picker |
| File system | expo-file-system |
| Sharing | expo-sharing + expo-clipboard |
| Markdown render | react-native-markdown-display |
| Usage tracking | @react-native-async-storage/async-storage |
| Python runtime | Chaquopy 16 (Android only) |
| Converter | MarkItDown (Python, via Chaquopy) |

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Run on Android
```bash
npx expo run:android
```
> Chaquopy will download Python 3.11 and install `markitdown[all]` during the first Gradle build (~2-5 min).

### 3. iOS (limited support)
```bash
npx expo run:ios
```
iOS uses JavaScript-based fallbacks for HTML, CSV, JSON, XML. PDF/DOCX/PPTX/XLSX are not supported on iOS without additional native work.

## Project structure

```
app/
  _layout.tsx          # Navigation shell
  index.tsx            # Home screen (file picker)
  preview.tsx          # Markdown preview + share
components/
  DailyLimitBar.tsx    # Freemium progress bar
  MarkdownViewer.tsx   # Rendered / raw toggle
  PaywallModal.tsx     # Upgrade sheet
hooks/
  useDailyLimit.ts     # 5/day limit + AsyncStorage
  useConverter.ts      # Conversion state machine
modules/MarkItDownModule/
  index.ts                               # TS interface
  android/build.gradle                   # Chaquopy config
  android/src/main/python/converter.py   # Python wrapper
  android/src/main/java/.../             # NativeModule bridge
```

## Freemium

- Free tier: **5 conversions per day** (resets at midnight)
- Pro tier: **unlimited** conversions
- Purchase state stored in AsyncStorage
- Wire up `expo-in-app-purchases` in the `onPurchase` handler in `app/index.tsx` for real billing
