import { z } from 'zod'

export const wheelSegmentSchema = z
  .object({
    id: z.string().optional(),
    label: z.string().min(1, 'Label is required'),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (e.g. #FF5733)'),
    weight: z
      .number({ invalid_type_error: 'Weight must be a number' })
      .positive('Weight must be greater than 0')
      .max(100, 'Weight cannot exceed 100'),
    prizeType: z.enum(['coins', 'freeSpin', 'bonus', 'nothing'], {
      errorMap: () => ({ message: 'Please select a prize type' }),
    }),
    prizeAmount: z
      .number({ invalid_type_error: 'Prize amount must be a number' })
      .min(0, 'Prize amount cannot be negative'),
    imageUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  })
  .superRefine((seg, ctx) => {
    if (seg.prizeType === 'nothing' && seg.prizeAmount !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['prizeAmount'],
        message: 'Prize amount must be 0 when prize type is "nothing"',
      })
    }
    if (seg.prizeType !== 'nothing' && seg.prizeAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['prizeAmount'],
        message: 'Prize amount must be greater than 0',
      })
    }
  })

export const wheelSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(80, 'Name must be at most 80 characters'),
    description: z.string(),
    status: z.enum(['draft', 'active', 'inactive']),
    segments: z
      .array(wheelSegmentSchema)
      .min(2, 'Wheel must have at least 2 segments')
      .max(12, 'Wheel cannot have more than 12 segments'),
    maxSpinsPerUser: z
      .number({ invalid_type_error: 'Must be a number' })
      .int('Must be an integer')
      .min(1, 'Must allow at least 1 spin per user'),
    spinCost: z
      .number({ invalid_type_error: 'Must be a number' })
      .min(0, 'Spin cost cannot be negative'),
    backgroundColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
    borderColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  })
  .superRefine((data, ctx) => {
    const total = data.segments.reduce((sum, s) => sum + s.weight, 0)
    if (Math.round(total) !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['segments'],
        message: `Segment weights must sum to exactly 100 (currently ${total.toFixed(1)})`,
      })
    }
  })

export type WheelFormValues = z.infer<typeof wheelSchema>
export type WheelSegmentFormValues = z.infer<typeof wheelSegmentSchema>
