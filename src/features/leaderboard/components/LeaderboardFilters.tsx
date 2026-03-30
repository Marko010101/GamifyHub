import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import type { LeaderboardStatus } from '@/types/leaderboard'

interface LeaderboardFiltersProps {
  status: string
  onStatusChange: (status: string) => void
}

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'draft' satisfies LeaderboardStatus, label: 'Draft' },
  { value: 'active' satisfies LeaderboardStatus, label: 'Active' },
  { value: 'completed' satisfies LeaderboardStatus, label: 'Completed' },
]

export function LeaderboardFilters({ status, onStatusChange }: LeaderboardFiltersProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={status}
          label="Status"
          onChange={(e) => onStatusChange(e.target.value)}
        >
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
