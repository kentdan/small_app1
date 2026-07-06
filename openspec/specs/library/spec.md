# library Specification

## Purpose
Persist every conversion result locally so users can reopen, copy, share, and
delete past conversions without re-converting — all without any data leaving
the device.

## Requirements

### Requirement: Conversions are saved to a local library
Every successful conversion SHALL be saved on-device before the preview is
shown: content to `documentDirectory/library/<id>.md` on native or
AsyncStorage on web, plus an index entry (id, fileName, createdAt, size,
snippet) in AsyncStorage.

#### Scenario: Conversion persists across app restarts
- **WHEN** a file is converted and the app is closed and reopened
- **THEN** the conversion appears in the home-screen list and its full
  markdown can be reopened

#### Scenario: No network involvement
- **WHEN** the library saves, reads, or deletes an entry
- **THEN** no network request of any kind is made

### Requirement: Home screen lists saved conversions
The home screen SHALL show saved conversions newest-first with name, snippet,
date, and size. Tapping a row SHALL reopen it in the preview screen; a
long-press SHALL offer deletion with confirmation.

#### Scenario: Reopen a past conversion
- **WHEN** the user taps a library row
- **THEN** the preview screen loads that entry's markdown from local storage
  by id (not via router params)

#### Scenario: Delete a conversion
- **WHEN** the user long-presses a row and confirms deletion
- **THEN** the content file and index entry are removed and the list refreshes

#### Scenario: Empty library
- **WHEN** no conversions have been saved
- **THEN** the list area shows an empty state explaining that converted files
  are stored on this device only
