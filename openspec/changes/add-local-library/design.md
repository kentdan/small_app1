# Design

## Storage layout

```
┌─────────────────────────────────────────────────────────┐
│                    LOCAL LIBRARY                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  AsyncStorage                                           │
│  ┌───────────────────────────────────────────────┐      │
│  │ mdconverter_library_v1  (index, small JSON)   │      │
│  │ [{ id, fileName, createdAt, size, snippet }]  │      │
│  └───────────────────────────────────────────────┘      │
│                                                         │
│  Content                                                │
│  ┌── native ────────────────────────────────────┐       │
│  │ documentDirectory/library/<id>.md            │       │
│  │ (survives app restarts, backed up with app)  │       │
│  └──────────────────────────────────────────────┘       │
│  ┌── web ───────────────────────────────────────┐       │
│  │ AsyncStorage: mdconverter_content_<id>       │       │
│  │ (localStorage-backed, ~5 MB budget)          │       │
│  └──────────────────────────────────────────────┘       │
│                                                         │
│  Nothing ever leaves the device. No network calls.      │
└─────────────────────────────────────────────────────────┘
```

## Why index + content are separate

The home list needs to render instantly without reading N markdown files.
The index is one small JSON blob (a few KB even with hundreds of entries);
content is loaded lazily only when a row is opened.

## Data flow

```
pick file ──▶ convertToMarkdown ──▶ saveConversion(name, md) ──▶ id
                                                                 │
                router.push /preview?id=… ◀──────────────────────┘
                        │
                getContent(id) ──▶ render

home screen ──▶ useLibrary() ──▶ listConversions() (index only)
     │ tap row ──▶ /preview?id=…
     │ long-press ──▶ confirm ──▶ deleteConversion(id) ──▶ refresh
```

`useLibrary` refreshes via `useFocusEffect`, so returning from preview after
a new conversion shows the new entry without manual reload.

## Decisions

- **No markdown in router params** for the main flow: large documents can
  exceed practical param limits and made back-navigation state heavy. The
  `markdown` param is kept only as a fallback for the Maestro deep-link test
  and legacy links.
- **IDs**: `Date.now().toString(36)` + random suffix — sortable enough,
  collision-safe for a single device.
- **Web dialogs**: RN `Alert.alert` silently no-ops on react-native-web, so
  `lib/notify.ts` wraps `window.alert`/`window.confirm` on web.
- **Delete gesture**: long-press with confirm. Hint text under the section
  header ("Tap to open · hold to delete") keeps it discoverable.

## Risks

- localStorage quota (~5 MB) on web caps the library size; acceptable — web
  is secondary, and the oldest entries can be deleted by the user.
- `documentDirectory` content is removed if the app is uninstalled — expected
  for a local-only app; stated in the empty-state copy.
