import React from 'react'
import { Box, Button, Container, Typography } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

interface State {
  hasError: boolean
  error: Error | null
}

interface Props {
  children: React.ReactNode
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              gap: 2,
              textAlign: 'center',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />
            <Typography variant="h4" fontWeight={700}>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary">
              An unexpected error occurred. Please try refreshing the page.
            </Typography>
            {this.state.error && (
              <Typography
                variant="caption"
                color="text.secondary"
                component="pre"
                sx={{
                  background: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  maxWidth: '100%',
                  overflow: 'auto',
                }}
              >
                {this.state.error.message}
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Box>
        </Container>
      )
    }

    return this.props.children
  }
}
