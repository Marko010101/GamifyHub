import { Chip } from '@mui/material'

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'

interface StatusChipProps {
  status: string
  colorMap?: Record<string, ChipColor>
  size?: 'small' | 'medium'
}

const DEFAULT_COLOR_MAP: Record<string, ChipColor> = {
  active: 'success',
  draft: 'default',
  completed: 'info',
  drawn: 'primary',
  cancelled: 'error',
  inactive: 'warning',
}

export function StatusChip({ status, colorMap, size = 'small' }: StatusChipProps) {
  const map = colorMap ?? DEFAULT_COLOR_MAP
  const color: ChipColor = map[status] ?? 'default'
  const label = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <Chip
      label={label}
      color={color}
      size={size}
      variant="outlined"
    />
  )
}
