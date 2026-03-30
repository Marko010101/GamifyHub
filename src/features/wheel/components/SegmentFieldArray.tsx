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
  Chip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useFieldArray, useFormContext, Controller, useWatch } from 'react-hook-form'
import type { WheelFormValues } from '@/schemas/wheel.schema'
import { ImageUrlField } from '@/components/common/ImageUrlField'

export function SegmentFieldArray() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<WheelFormValues>()

  const { fields, append, remove } = useFieldArray({ control, name: 'segments' })

  const watchedSegments = useWatch({ control, name: 'segments' })
  const weightTotal = watchedSegments?.reduce((sum, s) => sum + (Number(s?.weight) || 0), 0) ?? 0
  const isWeightValid = Math.round(weightTotal) === 100

  const arrayError =
    errors.segments?.root?.message ??
    (errors.segments as { message?: string } | undefined)?.message

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Segments
          </Typography>
          <Chip
            label={`Weight Total: ${weightTotal.toFixed(1)} / 100`}
            color={isWeightValid ? 'success' : weightTotal > 100 ? 'error' : 'warning'}
            size="small"
          />
        </Box>
        <Button
          startIcon={<AddIcon />}
          size="small"
          variant="outlined"
          disabled={fields.length >= 12}
          onClick={() =>
            append({
              id: crypto.randomUUID(),
              label: '',
              color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
              weight: 0,
              prizeType: 'coins',
              prizeAmount: 0,
              imageUrl: '',
            })
          }
        >
          Add Segment {fields.length >= 12 ? '(max 12)' : ''}
        </Button>
      </Box>

      {arrayError && (
        <FormHelperText error sx={{ mb: 1 }}>
          {arrayError}
        </FormHelperText>
      )}

      {fields.length < 2 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Add at least 2 segments. Weights must sum to 100.
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
              Segment #{index + 1}
            </Typography>
            <IconButton
              size="small"
              color="error"
              disabled={fields.length <= 2}
              onClick={() => remove(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Label"
                size="small"
                fullWidth
                {...register(`segments.${index}.label`)}
                error={Boolean(errors.segments?.[index]?.label)}
                helperText={errors.segments?.[index]?.label?.message}
              />
            </Grid>
            <Grid item xs={6} sm={1}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Color</Typography>
                <Controller
                  control={control}
                  name={`segments.${index}.color`}
                  render={({ field: f }) => (
                    <input
                      type="color"
                      value={f.value || '#cccccc'}
                      onChange={f.onChange}
                      style={{ width: 48, height: 38, cursor: 'pointer', border: 'none', borderRadius: 4 }}
                    />
                  )}
                />
                {errors.segments?.[index]?.color && (
                  <FormHelperText error>{errors.segments[index].color.message}</FormHelperText>
                )}
              </Box>
            </Grid>
            <Grid item xs={6} sm={1}>
              <TextField
                label="Weight"
                type="number"
                size="small"
                fullWidth
                inputProps={{ min: 0, max: 100, step: 1 }}
                {...register(`segments.${index}.weight`, { valueAsNumber: true })}
                error={Boolean(errors.segments?.[index]?.weight)}
                helperText={errors.segments?.[index]?.weight?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl size="small" fullWidth error={Boolean(errors.segments?.[index]?.prizeType)}>
                <InputLabel>Prize Type</InputLabel>
                <Controller
                  control={control}
                  name={`segments.${index}.prizeType`}
                  render={({ field: f }) => (
                    <Select label="Prize Type" {...f}>
                      <MenuItem value="coins">Coins</MenuItem>
                      <MenuItem value="freeSpin">Free Spin</MenuItem>
                      <MenuItem value="bonus">Bonus</MenuItem>
                      <MenuItem value="nothing">Nothing</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Prize Amount"
                type="number"
                size="small"
                fullWidth
                {...register(`segments.${index}.prizeAmount`, { valueAsNumber: true })}
                error={Boolean(errors.segments?.[index]?.prizeAmount)}
                helperText={errors.segments?.[index]?.prizeAmount?.message}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <ImageUrlField
                name={`segments.${index}.imageUrl`}
                error={errors.segments?.[index]?.imageUrl}
              />
            </Grid>
          </Grid>
        </Box>
      ))}
    </Box>
  )
}
