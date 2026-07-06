// Local-only library of converted files. Nothing leaves the device.
// Index (small JSON) lives in AsyncStorage; content is stored per-entry:
//   native → documentDirectory/library/<id>.md
//   web    → AsyncStorage (localStorage-backed)
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const INDEX_KEY = 'mdconverter_library_v1';
const CONTENT_PREFIX = 'mdconverter_content_';

export interface LibraryEntry {
  id: string;
  fileName: string;   // original file name, e.g. report.pdf
  createdAt: number;  // epoch ms
  size: number;       // markdown length in chars (≈ bytes)
  snippet: string;    // first line of content for the list row
}

const libraryDir = () => FileSystem.documentDirectory + 'library/';

async function loadIndex(): Promise<LibraryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as LibraryEntry[]) : [];
  } catch {
    return [];
  }
}

async function saveIndex(entries: LibraryEntry[]): Promise<void> {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(entries));
}

function makeSnippet(markdown: string): string {
  return markdown
    .replace(/[#>*`_\-|[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);
}

export async function saveConversion(fileName: string, markdown: string): Promise<string> {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(CONTENT_PREFIX + id, markdown);
  } else {
    await FileSystem.makeDirectoryAsync(libraryDir(), { intermediates: true }).catch(() => {});
    await FileSystem.writeAsStringAsync(libraryDir() + id + '.md', markdown, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  }

  const entries = await loadIndex();
  entries.unshift({
    id,
    fileName,
    createdAt: Date.now(),
    size: markdown.length,
    snippet: makeSnippet(markdown),
  });
  await saveIndex(entries);
  return id;
}

export async function listConversions(): Promise<LibraryEntry[]> {
  return loadIndex();
}

export async function getContent(id: string): Promise<string> {
  if (Platform.OS === 'web') {
    return (await AsyncStorage.getItem(CONTENT_PREFIX + id)) ?? '';
  }
  try {
    return await FileSystem.readAsStringAsync(libraryDir() + id + '.md');
  } catch {
    return '';
  }
}

export async function deleteConversion(id: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(CONTENT_PREFIX + id);
  } else {
    await FileSystem.deleteAsync(libraryDir() + id + '.md', { idempotent: true }).catch(() => {});
  }
  const entries = (await loadIndex()).filter(e => e.id !== id);
  await saveIndex(entries);
}
