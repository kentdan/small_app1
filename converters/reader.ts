// Platform-aware file reader.
// Web: document picker gives blob:// URIs — use fetch().
// Native: expo-file-system reads file:// URIs.
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export async function readAsBase64(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const buf = await fetch(uri).then(r => r.arrayBuffer());
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}

export async function readAsText(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    return fetch(uri).then(r => r.text());
  }
  return FileSystem.readAsStringAsync(uri);
}

// Write a text file and return its URI (native only; throws on web).
export async function writeText(fileName: string, content: string): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('writeText not available on web');
  }
  const path = FileSystem.cacheDirectory + fileName;
  await FileSystem.writeAsStringAsync(path, content, { encoding: FileSystem.EncodingType.UTF8 });
  return path;
}
