import { useNavigate, useParams } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorDisplay } from '@/components/common/ErrorDisplay'
import { ROUTES } from '@/constants/routes'
import { useLeaderboard } from '../composables/useLeaderboard'
import { useUpdateLeaderboard } from '../composables/useUpdateLeaderboard'
import { LeaderboardForm } from '../components/LeaderboardForm'
import type { LeaderboardFormValues } from '@/schemas/leaderboard.schema'

export function LeaderboardEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: leaderboard, isLoading, isError, error } = useLeaderboard(id!)
  const { mutate, isPending } = useUpdateLeaderboard()

  const handleSubmit = (values: LeaderboardFormValues) => {
    mutate(
      {
        id: id!,
        dto: {
          ...values,
          prizes: values.prizes.map((p) => ({
            ...p,
            id: p.id ?? crypto.randomUUID(),
          })),
        },
      },
      {
        onSuccess: () => navigate(ROUTES.LEADERBOARD.DETAIL(id!)),
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

  if (isError || !leaderboard) {
    return <ErrorDisplay error={error} />
  }

  const defaultValues: LeaderboardFormValues = {
    title: leaderboard.title,
    description: leaderboard.description,
    startDate: leaderboard.startDate.slice(0, 16),
    endDate: leaderboard.endDate.slice(0, 16),
    status: leaderboard.status,
    scoringType: leaderboard.scoringType,
    prizes: leaderboard.prizes,
    maxParticipants: leaderboard.maxParticipants,
  }

  return (
    <>
      <PageHeader title={`Edit: ${leaderboard.title}`} />
      <LeaderboardForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isPending={isPending}
        isEdit
        leaderboard={leaderboard}
      />
    </>
  )
}
