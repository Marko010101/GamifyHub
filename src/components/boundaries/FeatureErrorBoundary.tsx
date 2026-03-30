import React from 'react'
import { Alert, Box, Button, Typography } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

interface State {
  hasError: boolean
  error: Error | null
}

interface Props {
  featureName: string
  children: React.ReactNode
}

export class FeatureErrorBoundary extends React.Component<Props, State> {
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
        <Box sx={{ p: 3 }}>
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon />}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Retry
              </Button>
            }
          >
            <Typography variant="subtitle2" fontWeight={700}>
              {this.props.featureName} module encountered an error
            </Typography>
            {this.state.error && (
              <Typography variant="body2">{this.state.error.message}</Typography>
            )}
          </Alert>
        </Box>
      )
    }

    return this.props.children
  }
}
