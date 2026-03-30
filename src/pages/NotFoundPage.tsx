import { Box, Button, Typography } from '@mui/material'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
        textAlign: 'center',
      }}
    >
      <SearchOffIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
      <Typography variant="h3" fontWeight={700} color="text.disabled">
        404
      </Typography>
      <Typography variant="h5">Page Not Found</Typography>
      <Typography variant="body1" color="text.secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </Typography>
      <Button variant="contained" onClick={() => navigate(ROUTES.HOME)}>
        Back to Home
      </Button>
    </Box>
  )
}
