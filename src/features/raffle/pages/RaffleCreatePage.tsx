import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { ROUTES } from '@/constants/routes'
import { useCreateRaffle } from '../composables/useCreateRaffle'
import { RaffleComposer } from '../components/RaffleComposer'
import type { RaffleFormValues } from '@/schemas/raffle.schema'
import type { CreateRaffleDto } from '@/types/raffle'

export function RaffleCreatePage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateRaffle()

  const handleSubmit = (values: RaffleFormValues) => {
    const dto: CreateRaffleDto = {
      ...values,
      prizes: values.prizes.map((p) => ({ ...p, id: p.id ?? crypto.randomUUID() })),
    }
    mutate(dto, {
      onSuccess: (created) => navigate(ROUTES.RAFFLE.DETAIL(created.id)),
    })
  }

  return (
    <>
      <PageHeader title="Create Raffle" />
      <RaffleComposer onSubmit={handleSubmit} isPending={isPending} />
    </>
  )
}
