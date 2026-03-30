import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusChip } from '@/components/common/StatusChip'
import { ErrorDisplay } from '@/components/common/ErrorDisplay'
import { ROUTES } from '@/constants/routes'
import { useRaffle } from '../composables/useRaffle'
import { PrizeGallery } from '../components/PrizeGallery'

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
        {label}:
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  )
}

export function RaffleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: raffle, isLoading, isError, error } = useRaffle(id!)

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError || !raffle) {
    return <ErrorDisplay error={error} />
  }

  return (
    <>
      <PageHeader
        title={raffle.name}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              onClick={() => navigate(ROUTES.RAFFLE.LIST)}
            >
              Back
            </Button>
            {raffle.status !== 'drawn' && (
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                onClick={() => navigate(ROUTES.RAFFLE.EDIT(id!))}
              >
                Edit
              </Button>
            )}
          </Box>
        }
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Configuration
              </Typography>
              <InfoRow label="ID" value={<code>{raffle.id}</code>} />
              <InfoRow label="Description" value={raffle.description || '—'} />
              <InfoRow label="Status" value={<StatusChip status={raffle.status} />} />
              <InfoRow label="Ticket Price" value={raffle.ticketPrice.toLocaleString()} />
              <InfoRow label="Max Tickets / User" value={raffle.maxTicketsPerUser} />
              <InfoRow
                label="Total Ticket Limit"
                value={raffle.totalTicketLimit === null ? 'Unlimited' : raffle.totalTicketLimit.toLocaleString()}
              />
              <Divider sx={{ my: 1.5 }} />
              <InfoRow label="Start Date" value={new Date(raffle.startDate).toLocaleString()} />
              <InfoRow label="End Date" value={new Date(raffle.endDate).toLocaleString()} />
              <InfoRow label="Draw Date" value={new Date(raffle.drawDate).toLocaleString()} />
              <Divider sx={{ my: 1.5 }} />
              <InfoRow label="Created At" value={new Date(raffle.createdAt).toLocaleString()} />
              <InfoRow label="Updated At" value={new Date(raffle.updatedAt).toLocaleString()} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Prize Gallery ({raffle.prizes.length})
              </Typography>
              <PrizeGallery prizes={raffle.prizes} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}
