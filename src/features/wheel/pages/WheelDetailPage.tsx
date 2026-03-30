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
import { useWheel } from '../composables/useWheel'
import { WheelPreview } from '../components/WheelPreview'

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 150 }}>
        {label}:
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  )
}

export function WheelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: wheel, isLoading, isError, error } = useWheel(id!)

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError || !wheel) {
    return <ErrorDisplay error={error} />
  }

  return (
    <>
      <PageHeader
        title={wheel.name}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              onClick={() => navigate(ROUTES.WHEEL.LIST)}
            >
              Back
            </Button>
            <Button
              startIcon={<EditIcon />}
              variant="contained"
              onClick={() => navigate(ROUTES.WHEEL.EDIT(id!))}
            >
              Edit
            </Button>
          </Box>
        }
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ textAlign: 'center' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Wheel Preview
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <WheelPreview
                  segments={wheel.segments}
                  backgroundColor={wheel.backgroundColor}
                  borderColor={wheel.borderColor}
                  size={280}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Configuration
              </Typography>
              <InfoRow label="ID" value={<code>{wheel.id}</code>} />
              <InfoRow label="Description" value={wheel.description || '—'} />
              <InfoRow label="Status" value={<StatusChip status={wheel.status} />} />
              <InfoRow label="Spin Cost" value={wheel.spinCost === 0 ? 'Free' : wheel.spinCost.toLocaleString()} />
              <InfoRow label="Max Spins / User" value={wheel.maxSpinsPerUser} />
              <Divider sx={{ my: 1.5 }} />
              <InfoRow
                label="Background Color"
                value={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: wheel.backgroundColor, border: '1px solid divider' }} />
                    <code>{wheel.backgroundColor}</code>
                  </Box>
                }
              />
              <InfoRow
                label="Border Color"
                value={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: wheel.borderColor, border: '1px solid divider' }} />
                    <code>{wheel.borderColor}</code>
                  </Box>
                }
              />
              <Divider sx={{ my: 1.5 }} />
              <InfoRow label="Created At" value={new Date(wheel.createdAt).toLocaleString()} />
              <InfoRow label="Updated At" value={new Date(wheel.updatedAt).toLocaleString()} />
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Segments ({wheel.segments.length})
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 48 }} />
                      <TableCell>Label</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>Weight</TableCell>
                      <TableCell>Prize Type</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {wheel.segments.map((seg) => (
                      <TableRow key={seg.id}>
                        <TableCell sx={{ py: 0.5 }}>
                          <Avatar
                            variant="rounded"
                            src={seg.imageUrl || undefined}
                            sx={{ width: 32, height: 32, bgcolor: 'action.hover' }}
                          >
                            <ImageIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                          </Avatar>
                        </TableCell>
                        <TableCell>{seg.label}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: 0.5,
                                bgcolor: seg.color,
                                border: '1px solid rgba(0,0,0,0.1)',
                              }}
                            />
                            <code>{seg.color}</code>
                          </Box>
                        </TableCell>
                        <TableCell>{seg.weight}%</TableCell>
                        <TableCell>
                          <Chip label={seg.prizeType} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {seg.prizeType === 'nothing' ? '—' : seg.prizeAmount.toLocaleString()}
                        </TableCell>
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
