import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leaderboardSchema, type LeaderboardFormValues } from '@/schemas/leaderboard.schema'
import { NavigationBlocker } from '@/components/common/NavigationBlocker'
import { PrizeFieldArray } from './PrizeFieldArray'
import type { Leaderboard } from '@/types/leaderboard'

interface LeaderboardFormProps {
  defaultValues?: Partial<LeaderboardFormValues>
  onSubmit: (values: LeaderboardFormValues) => void
  isPending: boolean
  isEdit?: boolean
  leaderboard?: Leaderboard
}

const EMPTY_DEFAULTS: LeaderboardFormValues = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'draft',
  scoringType: 'points',
  prizes: [],
  maxParticipants: 100,
}

export function LeaderboardForm({
  defaultValues,
  onSubmit,
  isPending,
  isEdit = false,
  leaderboard,
}: LeaderboardFormProps) {
  const methods = useForm<LeaderboardFormValues>({
    resolver: zodResolver(leaderboardSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  })

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = methods

  return (
    <FormProvider {...methods}>
      <NavigationBlocker isDirty={isDirty} />
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Basic Information
            </Typography>
            <Grid container spacing={2.5}>
              {isEdit && leaderboard && (
                <Grid item xs={12}>
                  <TextField
                    label="ID"
                    value={leaderboard.id}
                    size="small"
                    fullWidth
                    disabled
                    sx={{ bgcolor: 'action.disabledBackground' }}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  label="Title"
                  size="small"
                  fullWidth
                  required
                  {...register('title')}
                  error={Boolean(errors.title)}
                  helperText={errors.title?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  {...register('description')}
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl size="small" fullWidth error={Boolean(errors.status)}>
                  <InputLabel>Status</InputLabel>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select label="Status" {...field}>
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl size="small" fullWidth error={Boolean(errors.scoringType)}>
                  <InputLabel>Scoring Type</InputLabel>
                  <Controller
                    control={control}
                    name="scoringType"
                    render={({ field }) => (
                      <Select label="Scoring Type" {...field}>
                        <MenuItem value="points">Points</MenuItem>
                        <MenuItem value="wins">Wins</MenuItem>
                        <MenuItem value="wagered">Wagered</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.scoringType && (
                    <FormHelperText>{errors.scoringType.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Max Participants"
                  type="number"
                  size="small"
                  fullWidth
                  required
                  {...register('maxParticipants', { valueAsNumber: true })}
                  error={Boolean(errors.maxParticipants)}
                  helperText={errors.maxParticipants?.message}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Schedule
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date"
                  type="datetime-local"
                  size="small"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  {...register('startDate')}
                  error={Boolean(errors.startDate)}
                  helperText={errors.startDate?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Date"
                  type="datetime-local"
                  size="small"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  {...register('endDate')}
                  error={Boolean(errors.endDate)}
                  helperText={errors.endDate?.message}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <PrizeFieldArray />
          </CardContent>
        </Card>

        {isEdit && leaderboard && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Metadata
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Created At</Typography>
                  <Typography variant="body2">{new Date(leaderboard.createdAt).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body2">{new Date(leaderboard.updatedAt).toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Leaderboard'}
          </Button>
        </Box>
      </Box>
    </FormProvider>
  )
}
