import { pdfToMarkdown } from './pdf';
import { docxToMarkdown } from './docx';
import { pptxToMarkdown } from './pptx';
import { xlsxToMarkdown } from './xlsx';
import { htmlToMarkdown } from './html';
import { csvToMarkdown, jsonToMarkdown, xmlToMarkdown, plainToMarkdown } from './text';
import * as FileSystem from 'expo-file-system';

export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/html',
  'text/csv',
  'application/json',
  'text/plain',
  'text/xml',
  'application/xml',
  'application/epub+zip',
];

export async function convertToMarkdown(filePath: string, mimeType: string): Promise<string> {
  const type = mimeType.toLowerCase();

  if (type === 'application/pdf') {
    return pdfToMarkdown(filePath);
  }

  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    type === 'application/msword'
  ) {
    return docxToMarkdown(filePath);
  }

  if (
    type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    type === 'application/vnd.ms-powerpoint'
  ) {
    return pptxToMarkdown(filePath);
  }

  if (
    type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    type === 'application/vnd.ms-excel'
  ) {
    return xlsxToMarkdown(filePath);
  }

  if (type === 'text/html') {
    const content = await FileSystem.readAsStringAsync(filePath);
    return htmlToMarkdown(content);
  }

  if (type === 'text/csv') {
    const content = await FileSystem.readAsStringAsync(filePath);
    return csvToMarkdown(content);
  }

  if (type === 'application/json') {
    const content = await FileSystem.readAsStringAsync(filePath);
    return jsonToMarkdown(content);
  }

  if (type === 'text/xml' || type === 'application/xml') {
    const content = await FileSystem.readAsStringAsync(filePath);
    return xmlToMarkdown(content);
  }

  if (type === 'text/plain') {
    const content = await FileSystem.readAsStringAsync(filePath);
    return plainToMarkdown(content);
  }

  // EPUB: it's a ZIP of XHTML — extract and join content
  if (type === 'application/epub+zip') {
    return epubToMarkdown(filePath);
  }

  throw new Error(`Unsupported format: ${mimeType}`);
}

async function epubToMarkdown(filePath: string): Promise<string> {
  const JSZip = (await import('jszip')).default;
  const base64 = await FileSystem.readAsStringAsync(filePath, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const zip = await JSZip.loadAsync(base64, { base64: true });

  const htmlFiles = Object.keys(zip.files).filter(
    name => name.endsWith('.html') || name.endsWith('.xhtml') || name.endsWith('.htm')
  );

  const sections: string[] = [];
  for (const file of htmlFiles) {
    const html = await zip.file(file)!.async('string');
    const md = htmlToMarkdown(html);
    if (md.trim()) sections.push(md);
  }

  return sections.join('\n\n---\n\n');
}
