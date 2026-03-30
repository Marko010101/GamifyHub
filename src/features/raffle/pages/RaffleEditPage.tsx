import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorDisplay } from '@/components/common/ErrorDisplay'
import { ROUTES } from '@/constants/routes'
import { useRaffle } from '../composables/useRaffle'
import { useUpdateRaffle } from '../composables/useUpdateRaffle'
import { RaffleComposer } from '../components/RaffleComposer'
import type { RaffleFormValues } from '@/schemas/raffle.schema'

export function RaffleEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: raffle, isLoading, isError, error } = useRaffle(id!)
  const { mutate, isPending } = useUpdateRaffle()

  // Guard: drawn raffles cannot be edited
  useEffect(() => {
    if (raffle && raffle.status === 'drawn') {
      navigate(ROUTES.RAFFLE.DETAIL(id!), { replace: true })
    }
  }, [raffle, id, navigate])

  const handleSubmit = (values: RaffleFormValues) => {
    mutate(
      {
        id: id!,
        dto: {
          ...values,
          prizes: values.prizes.map((p) => ({ ...p, id: p.id ?? crypto.randomUUID() })),
        },
      },
      {
        onSuccess: () => navigate(ROUTES.RAFFLE.DETAIL(id!)),
      },
    )
  }

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

  const defaultValues: RaffleFormValues = {
    name: raffle.name,
    description: raffle.description,
    startDate: raffle.startDate.slice(0, 16),
    endDate: raffle.endDate.slice(0, 16),
    drawDate: raffle.drawDate.slice(0, 16),
    status: raffle.status,
    ticketPrice: raffle.ticketPrice,
    maxTicketsPerUser: raffle.maxTicketsPerUser,
    prizes: raffle.prizes,
    totalTicketLimit: raffle.totalTicketLimit,
  }

  return (
    <>
      <PageHeader title={`Edit: ${raffle.name}`} />
      <RaffleComposer
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isPending={isPending}
        isEdit
        raffle={raffle}
      />
    </>
  )
}
