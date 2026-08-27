import { describe, expect, it } from 'vitest';
import { AGENTIC_REPORT_API_URL, parseAgenticReport } from '../src/lib/agentic-report';

const reportResponse = {
  score: 96,
  score_label: 'Strong technical baseline',
  scanned_at: '2026-08-26T17:56:15.929Z',
  score_breakdown: {
    essential: { earned: 74.7, available: 80 },
    recommended: { earned: 16.7, available: 20 },
    bonus: { points: 5 },
  },
};

describe('Is Agentic report data', () => {
  it('targets the current yannis.dev report', () => {
    expect(new URL(AGENTIC_REPORT_API_URL).searchParams.get('url')).toBe('https://yannis.dev');
  });

  it('parses the public API response into display data', () => {
    expect(parseAgenticReport(reportResponse)).toEqual({
      score: 96,
      scoreLabel: 'Strong technical baseline',
      scannedAt: '2026-08-26T17:56:15.929Z',
      scannedLabel: 'Aug 26, 2026',
      rows: [
        { id: 'essential', label: 'Essential', value: '74.7 / 80' },
        { id: 'recommended', label: 'Recommended', value: '16.7 / 20' },
        { id: 'bonus', label: 'Bonus', value: '+5' },
      ],
    });
  });

  it.each([-1, 101, Number.NaN, '96', null])('rejects an invalid score: %s', (score) => {
    expect(parseAgenticReport({ ...reportResponse, score })).toBeNull();
  });
});
