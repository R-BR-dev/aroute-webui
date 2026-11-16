import { describe, expect, it } from 'vitest'

import { durationParts } from '../duration'

describe('durationParts', () => {
  it('keeps the two most significant units', () => {
    expect(durationParts(4 * 86_400 + 3 * 3_600 + 12 * 60 + 5)).toEqual([
      { unit: 'days', value: 4 },
      { unit: 'hours', value: 3 },
    ])
    expect(durationParts(95)).toEqual([
      { unit: 'minutes', value: 1 },
      { unit: 'seconds', value: 35 },
    ])
  })

  it('drops a second unit that is zero', () => {
    expect(durationParts(3_600)).toEqual([{ unit: 'hours', value: 1 }])
    expect(durationParts(3_605)).toEqual([{ unit: 'hours', value: 1 }])
    expect(durationParts(60)).toEqual([{ unit: 'minutes', value: 1 }])
  })

  it('shows seconds for anything under a minute, including zero', () => {
    expect(durationParts(42)).toEqual([{ unit: 'seconds', value: 42 }])
    expect(durationParts(0)).toEqual([{ unit: 'seconds', value: 0 }])
  })

  it('treats fractions and negative numbers as whole, non-negative seconds', () => {
    expect(durationParts(59.9)).toEqual([{ unit: 'seconds', value: 59 }])
    expect(durationParts(-5)).toEqual([{ unit: 'seconds', value: 0 }])
  })
})
