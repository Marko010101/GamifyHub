import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { ROUTES } from '@/constants/routes'
import { useCreateWheel } from '../composables/useCreateWheel'
import { WheelForm } from '../components/WheelForm'
import type { WheelFormValues } from '@/schemas/wheel.schema'
import type { CreateWheelDto } from '@/types/wheel'

export function WheelCreatePage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateWheel()

  const handleSubmit = (values: WheelFormValues) => {
    const dto: CreateWheelDto = {
      ...values,
      segments: values.segments.map((s) => ({ ...s, id: s.id ?? crypto.randomUUID() })),
    }
    mutate(dto, {
      onSuccess: (created) => navigate(ROUTES.WHEEL.DETAIL(created.id)),
    })
  }

  return (
    <>
      <PageHeader title="Create Wheel" />
      <WheelForm onSubmit={handleSubmit} isPending={isPending} />
    </>
  )
}
