import {
  Box,
  Button,
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
import { useFieldArray, useFormContext, Controller } from 'react-hook-form'
import type { LeaderboardFormValues } from '@/schemas/leaderboard.schema'
import { ImageUrlField } from '@/components/common/ImageUrlField'

export function PrizeFieldArray() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<LeaderboardFormValues>()

  const { fields, append, remove } = useFieldArray({ control, name: 'prizes' })

  const arrayError = errors.prizes?.root?.message ?? (errors.prizes as { message?: string })?.message

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Prizes
        </Typography>
        <Button
          startIcon={<AddIcon />}
          size="small"
          variant="outlined"
          onClick={() =>
            append({
              id: crypto.randomUUID(),
              rank: fields.length + 1,
              name: '',
              type: 'coins',
              amount: 0,
              imageUrl: '',
            })
          }
        >
          Add Prize
        </Button>
      </Box>

      {arrayError && (
        <FormHelperText error sx={{ mb: 1 }}>
          {arrayError}
        </FormHelperText>
      )}

      {fields.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          No prizes added yet. Add at least one prize.
        </Typography>
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
            bgcolor: 'background.paper',
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
            <Grid item xs={12} sm={2}>
              <TextField
                label="Rank"
                type="number"
                size="small"
                fullWidth
                {...register(`prizes.${index}.rank`, { valueAsNumber: true })}
                error={Boolean(errors.prizes?.[index]?.rank)}
                helperText={errors.prizes?.[index]?.rank?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
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
                  render={({ field }) => (
                    <Select label="Type" {...field}>
                      <MenuItem value="coins">Coins</MenuItem>
                      <MenuItem value="freeSpin">Free Spin</MenuItem>
                      <MenuItem value="bonus">Bonus</MenuItem>
                    </Select>
                  )}
                />
                {errors.prizes?.[index]?.type && (
                  <FormHelperText>{errors.prizes[index].type.message}</FormHelperText>
                )}
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
              <ImageUrlField
                name={`prizes.${index}.imageUrl`}
                error={errors.prizes?.[index]?.imageUrl}
              />
            </Grid>
          </Grid>
        </Box>
      ))}
    </Box>
  )
}
