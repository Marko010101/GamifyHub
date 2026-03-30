import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import type { WheelStatus } from '@/types/wheel'

interface WheelFiltersProps {
  status: string
  onStatusChange: (status: string) => void
}

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'draft' satisfies WheelStatus, label: 'Draft' },
  { value: 'active' satisfies WheelStatus, label: 'Active' },
  { value: 'inactive' satisfies WheelStatus, label: 'Inactive' },
]

export function WheelFilters({ status, onStatusChange }: WheelFiltersProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
    </Box>
  )
}
