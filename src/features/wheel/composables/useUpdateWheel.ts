import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { updateWheel } from '../api/wheel.api'
import type { Wheel, UpdateWheelDto } from '@/types/wheel'
import type { PaginatedResponse } from '@/types/pagination'

export function useUpdateWheel() {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateWheelDto }) => updateWheel(id, dto),
    onMutate: async ({ id, dto }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.wheels.lists() })
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.wheels.detail(id) })
      const previousLists = queryClient.getQueriesData<PaginatedResponse<Wheel>>({
        queryKey: QUERY_KEYS.wheels.lists(),
      })
      const previousDetail = queryClient.getQueryData<Wheel>(QUERY_KEYS.wheels.detail(id))
      queryClient.setQueriesData<PaginatedResponse<Wheel>>(
        { queryKey: QUERY_KEYS.wheels.lists() },
        (old) =>
          old
            ? { ...old, data: old.data.map((item) => (item.id === id ? { ...item, ...dto } : item)) }
            : old,
      )
      if (previousDetail) {
        queryClient.setQueryData<Wheel>(QUERY_KEYS.wheels.detail(id), {
          ...previousDetail,
          ...dto,
        })
      }
      return { previousLists, previousDetail }
    },
    onError: (_err, { id }, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
      if (context?.previousDetail) {
        queryClient.setQueryData(QUERY_KEYS.wheels.detail(id), context.previousDetail)
      }
      enqueueSnackbar('Failed to update wheel', { variant: 'error' })
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.wheels.detail(data.id), data)
      enqueueSnackbar('Wheel updated successfully', { variant: 'success' })
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wheels.lists() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wheels.detail(id) })
    },
  })
}
