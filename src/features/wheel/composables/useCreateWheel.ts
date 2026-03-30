import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { createWheel } from '../api/wheel.api'
import type { Wheel } from '@/types/wheel'
import type { PaginatedResponse } from '@/types/pagination'

export function useCreateWheel() {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: createWheel,
    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.wheels.lists() })
      const previousLists = queryClient.getQueriesData<PaginatedResponse<Wheel>>({
        queryKey: QUERY_KEYS.wheels.lists(),
      })
      const tempId = `__temp__${Date.now()}`
      const optimisticItem: Wheel = {
        id: tempId,
        ...dto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      queryClient.setQueriesData<PaginatedResponse<Wheel>>(
        { queryKey: QUERY_KEYS.wheels.lists() },
        (old) => (old ? { data: [optimisticItem, ...old.data], total: old.total + 1 } : old),
      )
      return { previousLists, tempId }
    },
    onError: (_err, _dto, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
      enqueueSnackbar('Failed to create wheel', { variant: 'error' })
    },
    onSuccess: (data, _dto, context) => {
      queryClient.setQueriesData<PaginatedResponse<Wheel>>(
        { queryKey: QUERY_KEYS.wheels.lists() },
        (old) =>
          old
            ? { ...old, data: old.data.map((item) => (item.id === context?.tempId ? data : item)) }
            : old,
      )
      enqueueSnackbar('Wheel created successfully', { variant: 'success' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wheels.lists() })
    },
  })
}
