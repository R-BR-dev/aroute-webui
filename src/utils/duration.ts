export type DurationUnit = 'days' | 'hours' | 'minutes' | 'seconds'

export interface DurationPart {
  unit: DurationUnit
  value: number
}

const UNITS: readonly [DurationUnit, number][] = [
  ['days', 86_400],
  ['hours', 3_600],
  ['minutes', 60],
  ['seconds', 1],
]

/**
 * Splits a number of seconds into its two most significant units, which is as
 * precise as an uptime needs to be:
 *
 *     356 520 → 4 days, 3 hours
 *          95 → 1 minute, 35 seconds
 *       3 600 → 1 hour
 *
 * The result is data, not text: the caller words it in the interface language.
 */
export function durationParts(totalSeconds: number): DurationPart[] {
  let rest = Math.max(0, Math.floor(totalSeconds))
  const parts: DurationPart[] = []

  for (const [unit, size] of UNITS) {
    const value = Math.floor(rest / size)
    rest %= size

    // Skip leading zero units, but keep "0 seconds" so the result is never empty.
    const leadingZero = parts.length === 0 && value === 0 && unit !== 'seconds'
    if (!leadingZero) parts.push({ unit, value })
    if (parts.length === 2) break
  }

  // "1 hour, 0 minutes" reads better as "1 hour".
  if (parts.length === 2 && parts[1]?.value === 0) parts.pop()
  return parts
}
