import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import type { RaffleStatus } from '@/types/raffle'

interface RaffleFiltersProps {
  status: string
  onStatusChange: (status: string) => void
  startDateFrom: string
  onStartDateFromChange: (date: string) => void
  endDateTo: string
  onEndDateToChange: (date: string) => void
}

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'draft' satisfies RaffleStatus, label: 'Draft' },
  { value: 'active' satisfies RaffleStatus, label: 'Active' },
  { value: 'drawn' satisfies RaffleStatus, label: 'Drawn' },
  { value: 'cancelled' satisfies RaffleStatus, label: 'Cancelled' },
]

export function RaffleFilters({
  status,
  onStatusChange,
  startDateFrom,
  onStartDateFromChange,
  endDateTo,
  onEndDateToChange,
}: RaffleFiltersProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Status</InputLabel>
        <Select value={status} label="Status" onChange={(e) => onStatusChange(e.target.value)}>
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Start Date From"
        type="date"
        size="small"
        value={startDateFrom}
        onChange={(e) => onStartDateFromChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 170 }}
      />
      <TextField
        label="End Date To"
        type="date"
        size="small"
        value={endDateTo}
        onChange={(e) => onEndDateToChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 170 }}
      />
    </Box>
  )
}
