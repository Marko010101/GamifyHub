import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { ROUTES } from '@/constants/routes'
import { useCreateLeaderboard } from '../composables/useCreateLeaderboard'
import { LeaderboardForm } from '../components/LeaderboardForm'
import type { LeaderboardFormValues } from '@/schemas/leaderboard.schema'
import type { CreateLeaderboardDto } from '@/types/leaderboard'

export function LeaderboardCreatePage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateLeaderboard()

  const handleSubmit = (values: LeaderboardFormValues) => {
    const dto: CreateLeaderboardDto = {
      ...values,
      prizes: values.prizes.map((p) => ({
        ...p,
        id: p.id ?? crypto.randomUUID(),
      })),
    }
    mutate(dto, {
      onSuccess: (created) => {
        navigate(ROUTES.LEADERBOARD.DETAIL(created.id))
      },
    })
  }

  return (
    <>
      <PageHeader title="Create Leaderboard" />
      <LeaderboardForm onSubmit={handleSubmit} isPending={isPending} />
    </>
  )
}
