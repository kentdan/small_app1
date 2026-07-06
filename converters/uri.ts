// Infer MIME type from file extension when it's not provided (e.g. from Linking URLs)
const EXT_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  html: 'text/html',
  htm: 'text/html',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'text/xml',
  txt: 'text/plain',
  epub: 'application/epub+zip',
};

export function guessTypeFromUri(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase().split('?')[0] ?? '';
  return EXT_MAP[ext] ?? 'application/octet-stream';
}
