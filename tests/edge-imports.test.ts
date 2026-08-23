import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const checkedRoots = [
  join(root, 'netlify', 'edge-functions'),
  join(root, 'src', 'lib', 'agent'),
];
const checkedFiles = [
  join(root, 'src', 'lib', 'pages.ts'),
  join(root, 'src', 'lib', 'site.ts'),
];

function collectTypeScriptFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(path, entry.name);
    if (entry.isDirectory()) return collectTypeScriptFiles(entryPath);
    return entry.isFile() && extname(entry.name) === '.ts' ? [entryPath] : [];
  });
}

describe('Netlify edge import compatibility', () => {
  it('uses explicit file extensions in edge-reachable relative imports', () => {
    const files = [...checkedRoots.flatMap(collectTypeScriptFiles), ...checkedFiles];
    const importPattern = /\bfrom\s+['"](\.{1,2}\/[^'"]+)['"]|import\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g;
    const extensionPattern = /\.(?:ts|json|mjs|js)$/;
    const violations = files.flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      return [...source.matchAll(importPattern)]
        .map((match) => match[1] ?? match[2] ?? '')
        .filter((specifier) => !extensionPattern.test(specifier))
        .map((specifier) => `${relative(root, file)} -> ${specifier}`);
    });

    expect(violations).toEqual([]);
  });
});
