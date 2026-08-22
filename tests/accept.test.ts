import { describe, expect, it } from 'vitest';
import { chooseMediaType } from '../src/lib/agent/negotiate';

describe('chooseMediaType', () => {
  it('serves markdown for Accept: text/markdown', () => {
    expect(chooseMediaType('text/markdown')).toBe('text/markdown');
  });

  it('serves markdown when markdown is listed before html', () => {
    expect(chooseMediaType('text/markdown, text/html;q=0.8')).toBe('text/markdown');
  });

  it('serves html for Accept: text/html', () => {
    expect(chooseMediaType('text/html')).toBe('text/html');
  });

  it('serves html when markdown is explicitly rejected and html is offered', () => {
    expect(chooseMediaType('text/markdown;q=0, text/html')).toBe('text/html');
  });

  it('serves html when only markdown is rejected', () => {
    expect(chooseMediaType('text/markdown;q=0')).toBe('text/html');
  });

  it('serves html when Accept is missing', () => {
    expect(chooseMediaType(null)).toBe('text/html');
  });

  it('serves html for */*', () => {
    expect(chooseMediaType('*/*')).toBe('text/html');
  });

  it('returns 406 for a type the server cannot produce', () => {
    expect(chooseMediaType('application/pdf')).toBeNull();
  });

  it('does not treat a Chrome HTML Accept as markdown', () => {
    expect(
      chooseMediaType(
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      ),
    ).toBe('text/html');
  });

  it('honors q-values when markdown is preferred', () => {
    expect(chooseMediaType('text/markdown;q=1.0, text/html;q=0.7')).toBe('text/markdown');
  });
});
