import { SITE_DOMAIN } from './site.ts';

const targetUrl = `https://${SITE_DOMAIN}`;

export const AGENTIC_REPORT_URL = `https://is-agentic.com/scan/${SITE_DOMAIN}`;
export const AGENTIC_REPORT_API_URL =
  `https://is-agentic.com/api/v1/report?url=${encodeURIComponent(targetUrl)}`;

export const AGENTIC_REPORT_COPY = {
  heading: 'Built for humans. Legible to agents.',
  summary: 'A public measure of how well AI agents can discover, understand, and use this site.',
  footer: `Latest public audit of ${SITE_DOMAIN}.`,
  cta: 'View full report',
} as const;

export interface AgenticScoreRow {
  id: 'essential' | 'recommended' | 'bonus';
  label: string;
  value: string;
}

export interface AgenticReport {
  score: number;
  scoreLabel: string;
  scannedAt?: string;
  scannedLabel: string;
  rows: readonly AgenticScoreRow[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(value);
}

function parseBucket(
  value: unknown,
  id: 'essential' | 'recommended',
  label: string,
): AgenticScoreRow | undefined {
  if (!isRecord(value)) return undefined;

  const { earned, available } = value;
  if (
    !isFiniteNumber(earned) ||
    !isFiniteNumber(available) ||
    earned < 0 ||
    available <= 0 ||
    earned > available
  ) {
    return undefined;
  }

  return {
    id,
    label,
    value: `${formatNumber(earned)} / ${formatNumber(available)}`,
  };
}

/** Convert the public API response into the small, trusted shape rendered by the card. */
export function parseAgenticReport(value: unknown): AgenticReport | null {
  if (!isRecord(value) || !isFiniteNumber(value.score)) return null;
  if (value.score < 0 || value.score > 100) return null;

  const scoreLabel =
    typeof value.score_label === 'string' && value.score_label.trim()
      ? value.score_label.trim()
      : 'Latest completed report';
  const scannedAt =
    typeof value.scanned_at === 'string' && !Number.isNaN(Date.parse(value.scanned_at))
      ? value.scanned_at
      : undefined;
  const scannedLabel = scannedAt
    ? new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(scannedAt))
    : 'Latest completed scan';

  const rows: AgenticScoreRow[] = [];
  if (isRecord(value.score_breakdown)) {
    const essential = parseBucket(value.score_breakdown.essential, 'essential', 'Essential');
    const recommended = parseBucket(value.score_breakdown.recommended, 'recommended', 'Recommended');

    if (essential) rows.push(essential);
    if (recommended) rows.push(recommended);

    if (isRecord(value.score_breakdown.bonus)) {
      const points = value.score_breakdown.bonus.points;
      if (isFiniteNumber(points) && points >= 0) {
        rows.push({ id: 'bonus', label: 'Bonus', value: `+${formatNumber(points)}` });
      }
    }
  }

  return { score: value.score, scoreLabel, scannedAt, scannedLabel, rows };
}

export function agenticReportMarkdown(): string {
  return `## ${AGENTIC_REPORT_COPY.heading}

${AGENTIC_REPORT_COPY.summary}

The current score and breakdown are published in the [live Is Agentic report](${AGENTIC_REPORT_URL}).`;
}
