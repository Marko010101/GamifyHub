import { Alert, Button } from '@mui/material'
import { isAxiosError } from 'axios'

interface ErrorDisplayProps {
  error: unknown
  onRetry?: () => void
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status
    if (status === 404) return 'The requested resource was not found.'
    if (status === 403) return 'You do not have permission to access this resource.'
    if (status === 500) return 'A server error occurred. Please try again.'
    return error.message || 'An API error occurred.'
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <Alert
      severity="error"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    >
      {getErrorMessage(error)}
    </Alert>
  )
}
