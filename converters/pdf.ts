import * as FileSystem from 'expo-file-system';
// pdfjs-dist legacy build works in React Native (no canvas needed for text extraction)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfjs = require('pdfjs-dist/legacy/build/pdf');

// Disable web worker — React Native has no Worker API
pdfjs.GlobalWorkerOptions.workerSrc = '';

export async function pdfToMarkdown(filePath: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(filePath, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Decode base64 → Uint8Array
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const doc = await pdfjs.getDocument({ data: bytes }).promise;
  const sections: string[] = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();

    // Group items into lines by approximate Y position
    interface TextItem { str: string; transform: number[] }
    const items = content.items as TextItem[];
    const lineMap: Map<number, string[]> = new Map();

    for (const item of items) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push(item.str);
    }

    // Sort lines top-to-bottom (higher Y = higher on page in PDF coords)
    const sorted = [...lineMap.entries()].sort((a, b) => b[0] - a[0]);
    const pageText = sorted.map(([, parts]) => parts.join(' ')).join('\n');

    if (pageText.trim()) {
      sections.push(`## Page ${pageNum}\n\n${pageText}`);
    }
  }

  return sections.join('\n\n---\n\n');
}
