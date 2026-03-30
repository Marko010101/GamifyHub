import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { deleteWheel } from '../api/wheel.api'
import type { Wheel } from '@/types/wheel'
import type { PaginatedResponse } from '@/types/pagination'

export function useDeleteWheel() {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: deleteWheel,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.wheels.lists() })
      const previousLists = queryClient.getQueriesData<PaginatedResponse<Wheel>>({
        queryKey: QUERY_KEYS.wheels.lists(),
      })
      queryClient.setQueriesData<PaginatedResponse<Wheel>>(
        { queryKey: QUERY_KEYS.wheels.lists() },
        (old) =>
          old ? { data: old.data.filter((item) => item.id !== id), total: old.total - 1 } : old,
      )
      return { previousLists }
    },
    onError: (_err, _id, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
      enqueueSnackbar('Failed to delete wheel', { variant: 'error' })
    },
    onSuccess: () => {
      enqueueSnackbar('Wheel deleted', { variant: 'info' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wheels.lists() })
    },
  })
}
