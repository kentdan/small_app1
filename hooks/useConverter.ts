import { useState, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { convertToMarkdown, SUPPORTED_MIME_TYPES } from '@/converters';

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

export function useConverter() {
  const [state, setState] = useState<ConversionState>({ status: 'idle' });

  // Called when user taps the pick button
  const pickAndConvert = useCallback(async (
    onLimitReached: () => void,
    recordConversion: () => Promise<void>,
    canConvert: boolean,
  ) => {
    if (!canConvert) { onLimitReached(); return; }

    setState({ status: 'picking' });

    let pickerResult: DocumentPicker.DocumentPickerResult;
    try {
      pickerResult = await DocumentPicker.getDocumentAsync({
        type: SUPPORTED_MIME_TYPES,
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
    await runConvert(asset.uri, asset.name, asset.mimeType ?? '', recordConversion);
  }, []);

  // Called when a file is opened via "Open with" / share sheet
  const convertFromUri = useCallback(async (
    uri: string,
    fileName: string,
    mimeType: string,
    recordConversion: () => Promise<void>,
    canConvert: boolean,
    onLimitReached: () => void,
  ) => {
    if (!canConvert) { onLimitReached(); return; }
    await runConvert(uri, fileName, mimeType, recordConversion);
  }, []);

  async function runConvert(
    uri: string,
    fileName: string,
    mimeType: string,
    recordConversion: () => Promise<void>,
  ) {
    setState({ status: 'converting', fileName });
    try {
      const markdown = await convertToMarkdown(uri, mimeType);
      await recordConversion();
      setState({
        status: 'done',
        result: { fileName, fileType: mimeType, markdown, convertedAt: Date.now() },
      });
    } catch (err: unknown) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Conversion failed' });
    }
  }

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, pickAndConvert, convertFromUri, reset };
}
