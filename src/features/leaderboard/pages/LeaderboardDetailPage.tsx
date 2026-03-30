import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Avatar,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ImageIcon from '@mui/icons-material/Image'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusChip } from '@/components/common/StatusChip'
import { ErrorDisplay } from '@/components/common/ErrorDisplay'
import { ROUTES } from '@/constants/routes'
import { useLeaderboard } from '../composables/useLeaderboard'

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
        {label}:
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  )
}

export function LeaderboardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: leaderboard, isLoading, isError, error } = useLeaderboard(id!)

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError || !leaderboard) {
    return <ErrorDisplay error={error} />
  }

  return (
    <>
      <PageHeader
        title={leaderboard.title}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              onClick={() => navigate(ROUTES.LEADERBOARD.LIST)}
            >
              Back
            </Button>
            <Button
              startIcon={<EditIcon />}
              variant="contained"
              onClick={() => navigate(ROUTES.LEADERBOARD.EDIT(id!))}
            >
              Edit
            </Button>
          </Box>
        }
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Configuration
              </Typography>
              <InfoRow label="ID" value={<code>{leaderboard.id}</code>} />
              <InfoRow label="Description" value={leaderboard.description || '—'} />
              <InfoRow label="Status" value={<StatusChip status={leaderboard.status} />} />
              <InfoRow label="Scoring Type" value={<Chip label={leaderboard.scoringType} size="small" />} />
              <InfoRow label="Max Participants" value={leaderboard.maxParticipants.toLocaleString()} />
              <Divider sx={{ my: 1.5 }} />
              <InfoRow label="Start Date" value={new Date(leaderboard.startDate).toLocaleString()} />
              <InfoRow label="End Date" value={new Date(leaderboard.endDate).toLocaleString()} />
              <Divider sx={{ my: 1.5 }} />
              <InfoRow label="Created At" value={new Date(leaderboard.createdAt).toLocaleString()} />
              <InfoRow label="Updated At" value={new Date(leaderboard.updatedAt).toLocaleString()} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Prizes ({leaderboard.prizes.length})
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 48 }} />
                      <TableCell>Rank</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboard.prizes
                      .slice()
                      .sort((a, b) => a.rank - b.rank)
                      .map((prize) => (
                        <TableRow key={prize.id}>
                          <TableCell sx={{ py: 0.5 }}>
                            <Avatar
                              variant="rounded"
                              src={prize.imageUrl || undefined}
                              sx={{ width: 32, height: 32, bgcolor: 'action.hover' }}
                            >
                              <ImageIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                            </Avatar>
                          </TableCell>
                          <TableCell>#{prize.rank}</TableCell>
                          <TableCell>{prize.name}</TableCell>
                          <TableCell>
                            <Chip label={prize.type} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{prize.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}
