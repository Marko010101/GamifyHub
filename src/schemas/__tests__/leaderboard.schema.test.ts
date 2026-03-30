import { describe, it, expect } from 'vitest'
import { leaderboardPrizeSchema, leaderboardSchema } from '../leaderboard.schema'

const validPrize = {
  rank: 1,
  name: '1st Place',
  type: 'coins' as const,
  amount: 100,
  imageUrl: '',
}

const validLeaderboard = {
  title: 'Weekly Challenge',
  description: 'Top players win',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  status: 'draft' as const,
  scoringType: 'points' as const,
  prizes: [validPrize],
  maxParticipants: 10,
}

describe('leaderboardPrizeSchema', () => {
  it('accepts a valid prize', () => {
    expect(leaderboardPrizeSchema.safeParse(validPrize).success).toBe(true)
  })

  it('accepts empty imageUrl', () => {
    expect(leaderboardPrizeSchema.safeParse({ ...validPrize, imageUrl: '' }).success).toBe(true)
  })

  it('accepts a valid URL imageUrl', () => {
    const result = leaderboardPrizeSchema.safeParse({
      ...validPrize,
      imageUrl: 'https://example.com/img.png',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty prize name', () => {
    const result = leaderboardPrizeSchema.safeParse({ ...validPrize, name: '' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].message).toBe('Prize name is required')
  })

  it('rejects non-positive rank', () => {
    expect(leaderboardPrizeSchema.safeParse({ ...validPrize, rank: 0 }).success).toBe(false)
  })

  it('rejects non-integer rank', () => {
    expect(leaderboardPrizeSchema.safeParse({ ...validPrize, rank: 1.5 }).success).toBe(false)
  })

  it('rejects non-positive amount', () => {
    expect(leaderboardPrizeSchema.safeParse({ ...validPrize, amount: 0 }).success).toBe(false)
  })

  it('rejects invalid prize type', () => {
    const result = leaderboardPrizeSchema.safeParse({ ...validPrize, type: 'cash' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].message).toBe('Please select a prize type')
  })

  it('rejects non-empty non-URL imageUrl', () => {
    expect(
      leaderboardPrizeSchema.safeParse({ ...validPrize, imageUrl: 'not-a-url' }).success,
    ).toBe(false)
  })
})

describe('leaderboardSchema', () => {
  it('accepts a valid leaderboard', () => {
    expect(leaderboardSchema.safeParse(validLeaderboard).success).toBe(true)
  })

  it('rejects title shorter than 3 characters', () => {
    const result = leaderboardSchema.safeParse({ ...validLeaderboard, title: 'AB' })
    expect(result.success).toBe(false)
    if (!result.success)
      expect(result.error.issues[0].message).toBe('Title must be at least 3 characters')
  })

  it('rejects title longer than 100 characters', () => {
    expect(
      leaderboardSchema.safeParse({ ...validLeaderboard, title: 'A'.repeat(101) }).success,
    ).toBe(false)
  })

  it('requires start date', () => {
    expect(
      leaderboardSchema.safeParse({ ...validLeaderboard, startDate: '' }).success,
    ).toBe(false)
  })

  it('requires end date', () => {
    expect(leaderboardSchema.safeParse({ ...validLeaderboard, endDate: '' }).success).toBe(false)
  })

  it('rejects end date before start date', () => {
    const result = leaderboardSchema.safeParse({
      ...validLeaderboard,
      startDate: '2024-01-31',
      endDate: '2024-01-01',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('endDate'))
      expect(issue?.message).toBe('End date must be after start date')
    }
  })

  it('rejects end date equal to start date', () => {
    expect(
      leaderboardSchema.safeParse({
        ...validLeaderboard,
        startDate: '2024-01-01',
        endDate: '2024-01-01',
      }).success,
    ).toBe(false)
  })

  it('requires at least one prize', () => {
    expect(leaderboardSchema.safeParse({ ...validLeaderboard, prizes: [] }).success).toBe(false)
  })

  it('rejects prizes with duplicate ranks', () => {
    const result = leaderboardSchema.safeParse({
      ...validLeaderboard,
      prizes: [
        { ...validPrize, rank: 1 },
        { ...validPrize, rank: 1, name: 'Duplicate' },
      ],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('prizes'))
      expect(issue?.message).toBe('Prize ranks must be unique and sequential starting from 1')
    }
  })

  it('rejects prizes that do not start at rank 1', () => {
    expect(
      leaderboardSchema.safeParse({
        ...validLeaderboard,
        prizes: [{ ...validPrize, rank: 2 }],
      }).success,
    ).toBe(false)
  })

  it('rejects non-sequential prize ranks', () => {
    expect(
      leaderboardSchema.safeParse({
        ...validLeaderboard,
        prizes: [
          { ...validPrize, rank: 1 },
          { ...validPrize, rank: 3, name: '3rd' },
        ],
      }).success,
    ).toBe(false)
  })

  it('accepts multiple sequential prizes starting from rank 1', () => {
    expect(
      leaderboardSchema.safeParse({
        ...validLeaderboard,
        prizes: [
          { ...validPrize, rank: 1 },
          { ...validPrize, rank: 2, name: '2nd' },
          { ...validPrize, rank: 3, name: '3rd' },
        ],
      }).success,
    ).toBe(true)
  })

  it('rejects maxParticipants less than 2', () => {
    const result = leaderboardSchema.safeParse({ ...validLeaderboard, maxParticipants: 1 })
    expect(result.success).toBe(false)
    if (!result.success)
      expect(result.error.issues[0].message).toBe('Must have at least 2 participants')
  })

  it('rejects non-integer maxParticipants', () => {
    expect(
      leaderboardSchema.safeParse({ ...validLeaderboard, maxParticipants: 2.5 }).success,
    ).toBe(false)
  })
})
