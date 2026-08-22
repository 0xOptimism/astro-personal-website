/**
 * Minimal content negotiation for a site that produces only text/html and text/markdown.
 */

export const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8';
export const PLAIN_CONTENT_TYPE = 'text/plain; charset=utf-8';
export const VARY_ACCEPT = 'Accept, Accept-Encoding';

type MediaType = 'text/html' | 'text/markdown';

interface AcceptEntry {
  type: string;
  q: number;
}

function parseAcceptHeader(header: string): AcceptEntry[] {
  return header
    .split(',')
    .map((raw) => {
      const parts = raw.trim().split(';').map((s) => s.trim());
      const type = parts[0]?.toLowerCase() ?? '';
      let q = 1;
      for (const param of parts.slice(1)) {
        const [name, value] = param.split('=').map((s) => s.trim());
        if (name === 'q') {
          const parsed = Number(value);
          if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
        }
      }
      return { type, q };
    })
    .filter((entry) => entry.type !== '');
}

function matches(entry: AcceptEntry, candidate: MediaType): boolean {
  if (entry.type === '*/*') return true;
  if (entry.type === 'text/*') return candidate.startsWith('text/');
  return entry.type === candidate;
}

function score(entries: AcceptEntry[], candidate: MediaType): number {
  const exact = entries.find((entry) => entry.type === candidate);
  if (exact) return exact.q;
  const wildcard = entries.find((entry) => entry.type === 'text/*' || entry.type === '*/*');
  return wildcard?.q ?? 0;
}

export function chooseMediaType(acceptHeader: string | null): MediaType | null {
  if (!acceptHeader || acceptHeader.trim() === '' || acceptHeader === '*/*') return 'text/html';

  const entries = parseAcceptHeader(acceptHeader);
  if (entries.length === 0) return 'text/html';

  const markdownScore = score(entries, 'text/markdown');
  const htmlScore = score(entries, 'text/html');

  if (markdownScore === 0 && htmlScore === 0) {
    const anyPositive = entries.some((entry) => entry.q > 0);
    return anyPositive ? null : 'text/html';
  }

  return markdownScore > htmlScore ? 'text/markdown' : 'text/html';
}
