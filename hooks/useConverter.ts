import { useState, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { NativeModules, Platform } from 'react-native';

export interface ConversionResult {
  fileName: string;
  fileType: string;
  markdown: string;
  convertedAt: number;
}

type ConversionState =
  | { status: 'idle' }
  | { status: 'picking' }
  | { status: 'converting'; fileName: string }
  | { status: 'done'; result: ConversionResult }
  | { status: 'error'; message: string };

const SUPPORTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'text/html',
  'text/csv',
  'application/json',
  'text/xml',
  'application/xml',
  'image/jpeg',
  'image/png',
  'application/epub+zip',
];

async function runConversion(filePath: string, mimeType: string): Promise<string> {
  if (Platform.OS === 'android') {
    const { MarkItDownModule } = NativeModules;
    if (!MarkItDownModule) {
      throw new Error('MarkItDown native module not available. Run `expo run:android` with full build.');
    }
    return await MarkItDownModule.convert(filePath);
  }
  // iOS JS fallback — handled per-format
  return await convertWithJS(filePath, mimeType);
}

async function convertWithJS(filePath: string, mimeType: string): Promise<string> {
  const content = await FileSystem.readAsStringAsync(filePath, { encoding: FileSystem.EncodingType.UTF8 }).catch(() => '');

  if (mimeType === 'text/csv') {
    return csvToMarkdown(content);
  }
  if (mimeType === 'application/json') {
    return '```json\n' + content + '\n```';
  }
  if (mimeType === 'text/xml' || mimeType === 'application/xml') {
    return '```xml\n' + content + '\n```';
  }
  if (mimeType === 'text/html') {
    return htmlToMarkdown(content);
  }
  return '> Conversion not supported on iOS for this file type.\n\nFile: ' + filePath;
}

function csvToMarkdown(csv: string): string {
  const lines = csv.trim().split('\n').filter(Boolean);
  if (!lines.length) return '';
  const rows = lines.map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
  const header = '| ' + rows[0].join(' | ') + ' |';
  const divider = '| ' + rows[0].map(() => '---').join(' | ') + ' |';
  const body = rows.slice(1).map(r => '| ' + r.join(' | ') + ' |').join('\n');
  return [header, divider, body].filter(Boolean).join('\n');
}

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi, (_, n, t) => '#'.repeat(Number(n)) + ' ' + t.replace(/<[^>]+>/g, '') + '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, (_, t) => t.replace(/<[^>]+>/g, '') + '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function useConverter() {
  const [state, setState] = useState<ConversionState>({ status: 'idle' });

  const pickAndConvert = useCallback(async (onLimitReached: () => void, recordConversion: () => Promise<void>, canConvert: boolean) => {
    if (!canConvert) {
      onLimitReached();
      return;
    }

    setState({ status: 'picking' });
    let pickerResult: DocumentPicker.DocumentPickerResult;
    try {
      pickerResult = await DocumentPicker.getDocumentAsync({
        type: SUPPORTED_TYPES,
        copyToCacheDirectory: true,
      });
    } catch {
      setState({ status: 'idle' });
      return;
    }

    if (pickerResult.canceled || !pickerResult.assets?.length) {
      setState({ status: 'idle' });
      return;
    }

    const asset = pickerResult.assets[0];
    setState({ status: 'converting', fileName: asset.name });

    try {
      const markdown = await runConversion(asset.uri, asset.mimeType ?? '');
      await recordConversion();
      setState({
        status: 'done',
        result: {
          fileName: asset.name,
          fileType: asset.mimeType ?? 'unknown',
          markdown,
          convertedAt: Date.now(),
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Conversion failed';
      setState({ status: 'error', message });
    }
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, pickAndConvert, reset };
}
