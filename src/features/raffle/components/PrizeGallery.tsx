import { Avatar, Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import type { RafflePrize } from '@/types/raffle'

interface PrizeGalleryProps {
  prizes: RafflePrize[]
}

export function PrizeGallery({ prizes }: PrizeGalleryProps) {
  if (prizes.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No prizes configured.
      </Typography>
    )
  }

  return (
    <Grid container spacing={2}>
      {prizes.map((prize) => (
        <Grid item xs={12} sm={6} md={4} key={prize.id}>
          <Card variant="outlined">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
                bgcolor: 'action.hover',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Avatar
                variant="rounded"
                src={prize.imageUrl || undefined}
                sx={{ width: 72, height: 72, bgcolor: 'background.paper' }}
              >
                <ImageIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
              </Avatar>
            </Box>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {prize.name}
                </Typography>
                <Chip label={prize.type} size="small" variant="outlined" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Amount: <strong>{prize.amount.toLocaleString()}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quantity: <strong>{prize.quantity}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
