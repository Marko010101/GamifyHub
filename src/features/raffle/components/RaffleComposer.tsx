import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { Controller, useFieldArray, useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { raffleSchema, type RaffleFormValues } from '@/schemas/raffle.schema'
import { NavigationBlocker } from '@/components/common/NavigationBlocker'
import { ImageUrlField } from '@/components/common/ImageUrlField'
import type { Raffle } from '@/types/raffle'

interface RaffleComposerProps {
  defaultValues?: Partial<RaffleFormValues>
  onSubmit: (values: RaffleFormValues) => void
  isPending: boolean
  isEdit?: boolean
  raffle?: Raffle
}

const EMPTY_DEFAULTS: RaffleFormValues = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  drawDate: '',
  status: 'draft',
  ticketPrice: 100,
  maxTicketsPerUser: 5,
  prizes: [],
  totalTicketLimit: null,
}

export function RaffleComposer({
  defaultValues,
  onSubmit,
  isPending,
  isEdit = false,
  raffle,
}: RaffleComposerProps) {
  const methods = useForm<RaffleFormValues>({
    resolver: zodResolver(raffleSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  })

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = methods

  const { fields, append, remove } = useFieldArray({ control, name: 'prizes' })

  const prizesArrayError =
    errors.prizes?.root?.message ??
    (errors.prizes as { message?: string } | undefined)?.message

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
              {isEdit && raffle && (
                <Grid item xs={12}>
                  <TextField label="ID" value={raffle.id} size="small" fullWidth disabled />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  size="small"
                  fullWidth
                  required
                  {...register('name')}
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
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
                        <MenuItem value="drawn">Drawn</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Ticket Price"
                  type="number"
                  size="small"
                  fullWidth
                  required
                  {...register('ticketPrice', { valueAsNumber: true })}
                  error={Boolean(errors.ticketPrice)}
                  helperText={errors.ticketPrice?.message}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Max Tickets / User"
                  type="number"
                  size="small"
                  fullWidth
                  required
                  {...register('maxTicketsPerUser', { valueAsNumber: true })}
                  error={Boolean(errors.maxTicketsPerUser)}
                  helperText={errors.maxTicketsPerUser?.message}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Total Ticket Limit (blank = unlimited)"
                  type="number"
                  size="small"
                  fullWidth
                  {...register('totalTicketLimit', {
                    setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                  })}
                  error={Boolean(errors.totalTicketLimit)}
                  helperText={errors.totalTicketLimit?.message}
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
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Draw Date"
                  type="datetime-local"
                  size="small"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  {...register('drawDate')}
                  error={Boolean(errors.drawDate)}
                  helperText={errors.drawDate?.message}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Prizes
              </Typography>
              <Button
                startIcon={<AddIcon />}
                size="small"
                variant="outlined"
                onClick={() =>
                  append({
                    id: crypto.randomUUID(),
                    name: '',
                    type: 'coins',
                    amount: 0,
                    quantity: 1,
                    imageUrl: '',
                  })
                }
              >
                Add Prize
              </Button>
            </Box>
            {prizesArrayError && (
              <FormHelperText error sx={{ mb: 1 }}>
                {prizesArrayError}
              </FormHelperText>
            )}
            {fields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  p: 2,
                  mb: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    Prize #{index + 1}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => remove(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Name"
                      size="small"
                      fullWidth
                      {...register(`prizes.${index}.name`)}
                      error={Boolean(errors.prizes?.[index]?.name)}
                      helperText={errors.prizes?.[index]?.name?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl size="small" fullWidth error={Boolean(errors.prizes?.[index]?.type)}>
                      <InputLabel>Type</InputLabel>
                      <Controller
                        control={control}
                        name={`prizes.${index}.type`}
                        render={({ field: f }) => (
                          <Select label="Type" {...f}>
                            <MenuItem value="coins">Coins</MenuItem>
                            <MenuItem value="freeSpin">Free Spin</MenuItem>
                            <MenuItem value="bonus">Bonus</MenuItem>
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Amount"
                      type="number"
                      size="small"
                      fullWidth
                      {...register(`prizes.${index}.amount`, { valueAsNumber: true })}
                      error={Boolean(errors.prizes?.[index]?.amount)}
                      helperText={errors.prizes?.[index]?.amount?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Quantity"
                      type="number"
                      size="small"
                      fullWidth
                      {...register(`prizes.${index}.quantity`, { valueAsNumber: true })}
                      error={Boolean(errors.prizes?.[index]?.quantity)}
                      helperText={errors.prizes?.[index]?.quantity?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <ImageUrlField
                      name={`prizes.${index}.imageUrl`}
                      error={errors.prizes?.[index]?.imageUrl}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </CardContent>
        </Card>

        {isEdit && raffle && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Metadata
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Created At</Typography>
                  <Typography variant="body2">{new Date(raffle.createdAt).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body2">{new Date(raffle.updatedAt).toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Raffle'}
          </Button>
        </Box>
      </Box>
    </FormProvider>
  )
}
