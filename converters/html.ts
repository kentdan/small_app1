// HTML → Markdown.
// Primary: turndown (high quality, uses pure-JS @mixmark-io/domino for the DOM).
// Fallback: a zero-dependency regex converter, in case turndown's DOM shim
// fails to initialise on a given React Native / Hermes runtime.
import TurndownService from 'turndown';

let td: TurndownService | null = null;
function getTurndown(): TurndownService {
  if (!td) {
    td = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      fence: '```',
    });
  }
  return td;
}

export function htmlToMarkdown(html: string): string {
  try {
    return getTurndown().turndown(html).replace(/\n{3,}/g, '\n\n').trim();
  } catch {
    return regexHtmlToMarkdown(html);
  }
}

// Dependency-free fallback — handles the common block/inline tags.
function regexHtmlToMarkdown(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) => '\n' + '#'.repeat(Number(n)) + ' ' + strip(t) + '\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => '- ' + strip(t) + '\n')
    .replace(/<(p|div)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _tag, t) => strip(t) + '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function strip(s: string): string {
  return s.replace(/<[^>]+>/g, '').trim();
}
