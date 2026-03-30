import { z } from 'zod'

export const leaderboardPrizeSchema = z.object({
  id: z.string().optional(),
  rank: z
    .number({ invalid_type_error: 'Rank must be a number' })
    .int('Rank must be an integer')
    .positive('Rank must be positive'),
  name: z.string().min(1, 'Prize name is required'),
  type: z.enum(['coins', 'freeSpin', 'bonus'], {
    errorMap: () => ({ message: 'Please select a prize type' }),
  }),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0'),
  imageUrl: z.string().url('Must be a valid URL').or(z.literal('')),
})

export const leaderboardSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be at most 100 characters'),
    description: z.string(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    status: z.enum(['draft', 'active', 'completed']),
    scoringType: z.enum(['points', 'wins', 'wagered']),
    prizes: z
      .array(leaderboardPrizeSchema)
      .min(1, 'At least one prize is required'),
    maxParticipants: z
      .number({ invalid_type_error: 'Must be a number' })
      .int('Must be an integer')
      .min(2, 'Must have at least 2 participants'),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date must be after start date',
      })
    }

    const ranks = data.prizes.map((p) => p.rank).sort((a, b) => a - b)
    const isSequential =
      ranks.length > 0 &&
      ranks.every((rank, i) => rank === i + 1) &&
      new Set(ranks).size === ranks.length

    if (!isSequential) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['prizes'],
        message: 'Prize ranks must be unique and sequential starting from 1',
      })
    }
  })

export type LeaderboardFormValues = z.infer<typeof leaderboardSchema>
export type LeaderboardPrizeFormValues = z.infer<typeof leaderboardPrizeSchema>
