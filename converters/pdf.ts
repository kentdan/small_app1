import './polyfills'; // must run before pdfjs is required
import { readAsBase64 } from './reader';

// pdfjs-dist legacy build — no web worker, text extraction only (no canvas).
// Lazily required so the polyfills above are installed first.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjs: any;
function getPdfjs() {
  if (!pdfjs) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    pdfjs = require('pdfjs-dist/legacy/build/pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = ''; // run on main thread (no Worker in RN)
  }
  return pdfjs;
}

export async function pdfToMarkdown(filePath: string): Promise<string> {
  const base64 = await readAsBase64(filePath);

  // base64 → Uint8Array (atob is available on RN 0.74+)
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  let doc;
  try {
    const lib = getPdfjs();
    doc = await lib.getDocument({
      data: bytes,
      isEvalSupported: false, // Hermes has no eval
      useSystemFonts: false,
      disableFontFace: true,
    }).promise;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Could not read this PDF on-device (${msg}). It may be scanned/image-only or encrypted.`
    );
  }

  const sections: string[] = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();

    interface TextItem { str: string; transform: number[] }
    const items = content.items as TextItem[];
    const lineMap = new Map<number, string[]>();

    for (const item of items) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5]); // vertical position
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push(item.str);
    }

    // PDF y grows upward → sort descending for top-to-bottom reading order
    const sorted = [...lineMap.entries()].sort((a, b) => b[0] - a[0]);
    const pageText = sorted.map(([, parts]) => parts.join(' ')).join('\n');

    if (pageText.trim()) sections.push(`## Page ${pageNum}\n\n${pageText}`);
  }

  if (!sections.length) {
    return '> No selectable text found. This PDF may be a scanned image (OCR is not supported on-device).';
  }

  return sections.join('\n\n---\n\n');
}
