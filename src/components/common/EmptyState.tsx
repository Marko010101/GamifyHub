import { Box, Typography } from '@mui/material'
import InboxIcon from '@mui/icons-material/Inbox'

interface EmptyStateProps {
  message?: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  message = 'No items found',
  description,
  action,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 1.5,
        color: 'text.disabled',
      }}
    >
      <InboxIcon sx={{ fontSize: 56 }} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.disabled">
          {description}
        </Typography>
      )}
      {action}
    </Box>
  )
}
