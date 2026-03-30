import { z } from 'zod'

export const rafflePrizeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Prize name is required'),
  type: z.enum(['coins', 'freeSpin', 'bonus'], {
    errorMap: () => ({ message: 'Please select a prize type' }),
  }),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0'),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1'),
  imageUrl: z.string().url('Must be a valid URL').or(z.literal('')),
})

export const raffleSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(80, 'Name must be at most 80 characters'),
    description: z.string(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    drawDate: z.string().min(1, 'Draw date is required'),
    status: z.enum(['draft', 'active', 'drawn', 'cancelled']),
    ticketPrice: z
      .number({ invalid_type_error: 'Ticket price must be a number' })
      .positive('Ticket price must be greater than 0'),
    maxTicketsPerUser: z
      .number({ invalid_type_error: 'Must be a number' })
      .int('Must be an integer')
      .min(1, 'Must allow at least 1 ticket per user'),
    prizes: z.array(rafflePrizeSchema).min(1, 'At least one prize is required'),
    totalTicketLimit: z
      .number({ invalid_type_error: 'Must be a number' })
      .int('Must be an integer')
      .positive('Must be a positive number')
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date must be after start date',
      })
    }
    if (data.endDate && data.drawDate && data.drawDate <= data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['drawDate'],
        message: 'Draw date must be after end date',
      })
    }
  })

export type RaffleFormValues = z.infer<typeof raffleSchema>
export type RafflePrizeFormValues = z.infer<typeof rafflePrizeSchema>
