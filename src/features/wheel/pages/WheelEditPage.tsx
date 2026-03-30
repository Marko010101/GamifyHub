import { useNavigate, useParams } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorDisplay } from '@/components/common/ErrorDisplay'
import { ROUTES } from '@/constants/routes'
import { useWheel } from '../composables/useWheel'
import { useUpdateWheel } from '../composables/useUpdateWheel'
import { WheelForm } from '../components/WheelForm'
import type { WheelFormValues } from '@/schemas/wheel.schema'

export function WheelEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: wheel, isLoading, isError, error } = useWheel(id!)
  const { mutate, isPending } = useUpdateWheel()

  const handleSubmit = (values: WheelFormValues) => {
    mutate(
      {
        id: id!,
        dto: {
          ...values,
          segments: values.segments.map((s) => ({ ...s, id: s.id ?? crypto.randomUUID() })),
        },
      },
      {
        onSuccess: () => navigate(ROUTES.WHEEL.DETAIL(id!)),
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

  if (isError || !wheel) {
    return <ErrorDisplay error={error} />
  }

  const defaultValues: WheelFormValues = {
    name: wheel.name,
    description: wheel.description,
    status: wheel.status,
    segments: wheel.segments,
    maxSpinsPerUser: wheel.maxSpinsPerUser,
    spinCost: wheel.spinCost,
    backgroundColor: wheel.backgroundColor,
    borderColor: wheel.borderColor,
  }

  return (
    <>
      <PageHeader title={`Edit: ${wheel.name}`} />
      <WheelForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isPending={isPending}
        isEdit
        wheel={wheel}
      />
    </>
  )
}
