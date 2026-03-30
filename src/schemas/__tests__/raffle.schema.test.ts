import { describe, it, expect } from 'vitest'
import { rafflePrizeSchema, raffleSchema } from '../raffle.schema'

const validPrize = {
  name: 'Grand Prize',
  type: 'coins' as const,
  amount: 500,
  quantity: 1,
  imageUrl: '',
}

const validRaffle = {
  name: 'Weekly Raffle',
  description: 'Win big prizes',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  drawDate: '2024-02-01',
  status: 'draft' as const,
  ticketPrice: 10,
  maxTicketsPerUser: 5,
  prizes: [validPrize],
  totalTicketLimit: null,
}

describe('rafflePrizeSchema', () => {
  it('accepts a valid prize', () => {
    expect(rafflePrizeSchema.safeParse(validPrize).success).toBe(true)
  })

  it('accepts empty imageUrl', () => {
    expect(rafflePrizeSchema.safeParse({ ...validPrize, imageUrl: '' }).success).toBe(true)
  })

  it('rejects empty prize name', () => {
    const result = rafflePrizeSchema.safeParse({ ...validPrize, name: '' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].message).toBe('Prize name is required')
  })

  it('rejects positive amount of 0', () => {
    expect(rafflePrizeSchema.safeParse({ ...validPrize, amount: 0 }).success).toBe(false)
  })

  it('rejects quantity less than 1', () => {
    const result = rafflePrizeSchema.safeParse({ ...validPrize, quantity: 0 })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].message).toBe('Quantity must be at least 1')
  })

  it('rejects non-integer quantity', () => {
    expect(rafflePrizeSchema.safeParse({ ...validPrize, quantity: 1.5 }).success).toBe(false)
  })

  it('rejects invalid prize type', () => {
    const result = rafflePrizeSchema.safeParse({ ...validPrize, type: 'cash' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].message).toBe('Please select a prize type')
  })

  it('rejects non-empty non-URL imageUrl', () => {
    expect(rafflePrizeSchema.safeParse({ ...validPrize, imageUrl: 'not-a-url' }).success).toBe(
      false,
    )
  })
})

describe('raffleSchema', () => {
  it('accepts a valid raffle', () => {
    expect(raffleSchema.safeParse(validRaffle).success).toBe(true)
  })

  it('accepts null totalTicketLimit', () => {
    expect(raffleSchema.safeParse({ ...validRaffle, totalTicketLimit: null }).success).toBe(true)
  })

  it('accepts positive integer totalTicketLimit', () => {
    expect(raffleSchema.safeParse({ ...validRaffle, totalTicketLimit: 100 }).success).toBe(true)
  })

  it('rejects name shorter than 3 characters', () => {
    const result = raffleSchema.safeParse({ ...validRaffle, name: 'AB' })
    expect(result.success).toBe(false)
    if (!result.success)
      expect(result.error.issues[0].message).toBe('Name must be at least 3 characters')
  })

  it('rejects name longer than 80 characters', () => {
    expect(raffleSchema.safeParse({ ...validRaffle, name: 'A'.repeat(81) }).success).toBe(false)
  })

  it('requires start date', () => {
    expect(raffleSchema.safeParse({ ...validRaffle, startDate: '' }).success).toBe(false)
  })

  it('requires end date', () => {
    expect(raffleSchema.safeParse({ ...validRaffle, endDate: '' }).success).toBe(false)
  })

  it('requires draw date', () => {
    expect(raffleSchema.safeParse({ ...validRaffle, drawDate: '' }).success).toBe(false)
  })

  it('rejects end date before start date', () => {
    const result = raffleSchema.safeParse({
      ...validRaffle,
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
      raffleSchema.safeParse({
        ...validRaffle,
        startDate: '2024-01-01',
        endDate: '2024-01-01',
      }).success,
    ).toBe(false)
  })

  it('rejects draw date before end date', () => {
    const result = raffleSchema.safeParse({
      ...validRaffle,
      endDate: '2024-01-31',
      drawDate: '2024-01-15',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('drawDate'))
      expect(issue?.message).toBe('Draw date must be after end date')
    }
  })

  it('rejects draw date equal to end date', () => {
    expect(
      raffleSchema.safeParse({
        ...validRaffle,
        endDate: '2024-01-31',
        drawDate: '2024-01-31',
      }).success,
    ).toBe(false)
  })

  it('rejects non-positive ticketPrice', () => {
    const result = raffleSchema.safeParse({ ...validRaffle, ticketPrice: 0 })
    expect(result.success).toBe(false)
    if (!result.success)
      expect(result.error.issues[0].message).toBe('Ticket price must be greater than 0')
  })

  it('rejects maxTicketsPerUser less than 1', () => {
    expect(raffleSchema.safeParse({ ...validRaffle, maxTicketsPerUser: 0 }).success).toBe(false)
  })

  it('requires at least one prize', () => {
    expect(raffleSchema.safeParse({ ...validRaffle, prizes: [] }).success).toBe(false)
  })
})
