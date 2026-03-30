import { Box, Button, Chip, MenuItem, Select, Typography } from '@mui/material'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { updateLeaderboard } from '../api/leaderboard.api'
import type { Leaderboard, LeaderboardStatus } from '@/types/leaderboard'
import type { PaginatedResponse } from '@/types/pagination'

interface BulkStatusToggleProps {
  selectedIds: string[]
  onClear: () => void
}

export function BulkStatusToggle({ selectedIds, onClear }: BulkStatusToggleProps) {
  const [targetStatus, setTargetStatus] = useState<LeaderboardStatus>('active')
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: LeaderboardStatus }) =>
      Promise.all(ids.map((id) => updateLeaderboard(id, { status }))),
    onMutate: async ({ ids, status }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.leaderboards.lists() })
      const previousLists = queryClient.getQueriesData<PaginatedResponse<Leaderboard>>({
        queryKey: QUERY_KEYS.leaderboards.lists(),
      })
      queryClient.setQueriesData<PaginatedResponse<Leaderboard>>(
        { queryKey: QUERY_KEYS.leaderboards.lists() },
        (old) =>
          old
            ? {
                ...old,
                data: old.data.map((item) =>
                  ids.includes(item.id) ? { ...item, status } : item,
                ),
              }
            : old,
      )
      return { previousLists }
    },
    onError: (_err, _vars, context) => {
      context?.previousLists.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data))
      enqueueSnackbar('Some updates failed', { variant: 'error' })
    },
    onSuccess: (_data, { ids, status }) => {
      enqueueSnackbar(
        `${ids.length} leaderboard${ids.length > 1 ? 's' : ''} set to ${status}`,
        { variant: 'success' },
      )
      onClear()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leaderboards.lists() })
    },
  })

  if (selectedIds.length === 0) return null

  const handleApply = () => {
    mutate({ ids: selectedIds, status: targetStatus })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        bgcolor: 'primary.50',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'primary.200',
        mb: 2,
      }}
    >
      <Chip label={`${selectedIds.length} selected`} color="primary" size="small" />
      <Typography variant="body2" sx={{ mr: 'auto' }}>
        Set status to:
      </Typography>
      <Select
        size="small"
        value={targetStatus}
        onChange={(e) => setTargetStatus(e.target.value as LeaderboardStatus)}
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="draft">Draft</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
      </Select>
      <Button
        variant="contained"
        size="small"
        onClick={handleApply}
        disabled={isPending}
      >
        Apply
      </Button>
      <Button variant="outlined" size="small" onClick={onClear}>
        Clear
      </Button>
    </Box>
  )
}
