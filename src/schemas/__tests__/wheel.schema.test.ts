import { describe, it, expect } from 'vitest'
import { wheelSegmentSchema, wheelSchema } from '../wheel.schema'

const validSegment = {
  label: 'Win 100',
  color: '#FF5733',
  weight: 50,
  prizeType: 'coins' as const,
  prizeAmount: 100,
  imageUrl: '',
}

const nothingSegment = {
  label: 'Better luck',
  color: '#CCCCCC',
  weight: 50,
  prizeType: 'nothing' as const,
  prizeAmount: 0,
  imageUrl: '',
}

const validWheel = {
  name: 'Lucky Wheel',
  description: 'Spin to win',
  status: 'draft' as const,
  segments: [validSegment, nothingSegment],
  maxSpinsPerUser: 3,
  spinCost: 0,
  backgroundColor: '#FFFFFF',
  borderColor: '#000000',
}

describe('wheelSegmentSchema', () => {
  it('accepts a valid segment with a prize', () => {
    expect(wheelSegmentSchema.safeParse(validSegment).success).toBe(true)
  })

  it('accepts a "nothing" segment with prizeAmount 0', () => {
    expect(wheelSegmentSchema.safeParse(nothingSegment).success).toBe(true)
  })

  it('accepts empty imageUrl', () => {
    expect(wheelSegmentSchema.safeParse({ ...validSegment, imageUrl: '' }).success).toBe(true)
  })

  it('rejects empty label', () => {
    const result = wheelSegmentSchema.safeParse({ ...validSegment, label: '' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].message).toBe('Label is required')
  })

  it('rejects invalid hex color', () => {
    const result = wheelSegmentSchema.safeParse({ ...validSegment, color: 'red' })
    expect(result.success).toBe(false)
    if (!result.success)
      expect(result.error.issues[0].message).toBe('Must be a valid hex color (e.g. #FF5733)')
  })

  it('rejects 3-digit hex (must be 6-digit)', () => {
    expect(wheelSegmentSchema.safeParse({ ...validSegment, color: '#FFF' }).success).toBe(false)
  })

  it('rejects weight of 0', () => {
    expect(wheelSegmentSchema.safeParse({ ...validSegment, weight: 0 }).success).toBe(false)
  })

  it('rejects weight greater than 100', () => {
    expect(wheelSegmentSchema.safeParse({ ...validSegment, weight: 101 }).success).toBe(false)
  })

  it('rejects prizeAmount > 0 when prizeType is "nothing"', () => {
    const result = wheelSegmentSchema.safeParse({ ...nothingSegment, prizeAmount: 50 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('prizeAmount'))
      expect(issue?.message).toBe('Prize amount must be 0 when prize type is "nothing"')
    }
  })

  it('rejects prizeAmount of 0 for non-"nothing" prize types', () => {
    const result = wheelSegmentSchema.safeParse({ ...validSegment, prizeAmount: 0 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('prizeAmount'))
      expect(issue?.message).toBe('Prize amount must be greater than 0')
    }
  })
})

describe('wheelSchema', () => {
  it('accepts a valid wheel', () => {
    expect(wheelSchema.safeParse(validWheel).success).toBe(true)
  })

  it('accepts spinCost of 0', () => {
    expect(wheelSchema.safeParse({ ...validWheel, spinCost: 0 }).success).toBe(true)
  })

  it('rejects name shorter than 3 characters', () => {
    expect(wheelSchema.safeParse({ ...validWheel, name: 'AB' }).success).toBe(false)
  })

  it('rejects name longer than 80 characters', () => {
    expect(wheelSchema.safeParse({ ...validWheel, name: 'A'.repeat(81) }).success).toBe(false)
  })

  it('rejects fewer than 2 segments', () => {
    expect(
      wheelSchema.safeParse({ ...validWheel, segments: [{ ...validSegment, weight: 100 }] })
        .success,
    ).toBe(false)
  })

  it('rejects more than 12 segments', () => {
    const segments = Array.from({ length: 13 }, (_, i) => ({
      ...validSegment,
      label: `Seg ${i}`,
      weight: 8,
    }))
    expect(wheelSchema.safeParse({ ...validWheel, segments }).success).toBe(false)
  })

  it('rejects when segment weights do not sum to 100', () => {
    const result = wheelSchema.safeParse({
      ...validWheel,
      segments: [
        { ...validSegment, weight: 60 },
        { ...nothingSegment, weight: 30 },
      ],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('segments'))
      expect(issue?.message).toMatch(/Segment weights must sum to exactly 100/)
    }
  })

  it('accepts weights that sum to 100 via floating-point rounding', () => {
    // 33.3 + 33.3 + 33.4 = 100.0; Math.round(100.0) === 100
    const segments = [
      { ...validSegment, weight: 33.3 },
      { ...validSegment, label: 'Seg 2', weight: 33.3 },
      { ...nothingSegment, weight: 33.4 },
    ]
    expect(wheelSchema.safeParse({ ...validWheel, segments }).success).toBe(true)
  })

  it('rejects spinCost less than 0', () => {
    expect(wheelSchema.safeParse({ ...validWheel, spinCost: -1 }).success).toBe(false)
  })

  it('rejects maxSpinsPerUser less than 1', () => {
    expect(wheelSchema.safeParse({ ...validWheel, maxSpinsPerUser: 0 }).success).toBe(false)
  })

  it('rejects invalid backgroundColor hex', () => {
    expect(wheelSchema.safeParse({ ...validWheel, backgroundColor: 'white' }).success).toBe(false)
  })

  it('rejects invalid borderColor hex', () => {
    expect(wheelSchema.safeParse({ ...validWheel, borderColor: '#GGG' }).success).toBe(false)
  })
})
