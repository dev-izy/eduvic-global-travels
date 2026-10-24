export type DurationUnit = "days" | "months" | "years";

export const DURATION_UNITS: { value: DurationUnit; label: string }[] = [
  { value: "days", label: "Days" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
];

/** Rough day equivalents, used only to sort and compare mixed units. */
const DAYS_PER_UNIT: Record<DurationUnit, number> = {
  days: 1,
  months: 30,
  years: 365,
};

export function normalizeUnit(unit: string | null | undefined): DurationUnit {
  return unit === "months" || unit === "years" ? unit : "days";
}

/** "7 days", "1 month", "2 years" — singular when the value is exactly 1. */
export function formatDuration(
  value: number | string | null | undefined,
  unit: string | null | undefined
): string {
  const n = Number(value) || 0;
  const u = normalizeUnit(unit);
  const word = n === 1 ? u.slice(0, -1) : u;
  return `${n} ${word}`;
}

/** Same as formatDuration but capitalised, for badges and spec rows. */
export function formatDurationTitle(
  value: number | string | null | undefined,
  unit: string | null | undefined
): string {
  const text = formatDuration(value, unit);
  return text.replace(/\s(\w)/, (_, c: string) => ` ${c.toUpperCase()}`);
}

/**
 * Approximate length in days, so a 2-week trip and a 6-month programme can be
 * sorted against each other. Never shown to anyone — comparison only.
 */
export function durationInDays(
  value: number | string | null | undefined,
  unit: string | null | undefined
): number {
  return (Number(value) || 0) * DAYS_PER_UNIT[normalizeUnit(unit)];
}

/** Stable key for filter dropdowns, e.g. "6|months". */
export function durationKey(
  value: number | string | null | undefined,
  unit: string | null | undefined
): string {
  return `${Number(value) || 0}|${normalizeUnit(unit)}`;
}