import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useCreateLeaderboard } from '../useCreateLeaderboard'
import { useUpdateLeaderboard } from '../useUpdateLeaderboard'
import { useDeleteLeaderboard } from '../useDeleteLeaderboard'
import {
  createLeaderboard,
  updateLeaderboard,
  deleteLeaderboard,
} from '../../api/leaderboard.api'
import { QUERY_KEYS } from '@/constants/queryKeys'
import type { Leaderboard, CreateLeaderboardDto } from '@/types/leaderboard'
import type { PaginatedResponse } from '@/types/pagination'

const mockEnqueueSnackbar = vi.fn()
vi.mock('notistack', () => ({ useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar }) }))
vi.mock('../../api/leaderboard.api', () => ({
  createLeaderboard: vi.fn(),
  updateLeaderboard: vi.fn(),
  deleteLeaderboard: vi.fn(),
}))

const mockLeaderboard: Leaderboard = {
  id: '1',
  title: 'Test',
  description: '',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  status: 'draft',
  scoringType: 'points',
  prizes: [],
  maxParticipants: 10,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const createDto: CreateLeaderboardDto = {
  title: 'New Leaderboard',
  description: '',
  startDate: '2024-02-01',
  endDate: '2024-02-28',
  status: 'draft',
  scoringType: 'points',
  prizes: [],
  maxParticipants: 10,
}

const listKey = QUERY_KEYS.leaderboards.list({})

let queryClient: QueryClient

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  vi.clearAllMocks()
})

function Wrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

// ─── useCreateLeaderboard ────────────────────────────────────────────────────

describe('useCreateLeaderboard', () => {
  it('calls createLeaderboard with the dto', async () => {
    vi.mocked(createLeaderboard).mockResolvedValue(mockLeaderboard)
    const { result } = renderHook(() => useCreateLeaderboard(), { wrapper: Wrapper })

    await result.current.mutateAsync(createDto)

    expect(createLeaderboard).toHaveBeenCalledWith(createDto, expect.any(Object))
  })

  it('shows success snackbar', async () => {
    vi.mocked(createLeaderboard).mockResolvedValue(mockLeaderboard)
    const { result } = renderHook(() => useCreateLeaderboard(), { wrapper: Wrapper })

    await result.current.mutateAsync(createDto)

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Leaderboard created successfully', {
      variant: 'success',
    })
  })

  it('shows error snackbar on failure', async () => {
    vi.mocked(createLeaderboard).mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useCreateLeaderboard(), { wrapper: Wrapper })

    result.current.mutate(createDto)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Failed to create leaderboard', {
      variant: 'error',
    })
  })

  it('inserts optimistic item at top of list before API resolves', async () => {
    let resolveApi!: (v: Leaderboard) => void
    vi.mocked(createLeaderboard).mockReturnValue(
      new Promise<Leaderboard>((res) => {
        resolveApi = res
      }),
    )
    queryClient.setQueryData(listKey, { data: [mockLeaderboard], total: 1 })

    const { result } = renderHook(() => useCreateLeaderboard(), { wrapper: Wrapper })
    result.current.mutate(createDto)

    await waitFor(() => {
      const cached = queryClient.getQueryData<PaginatedResponse<Leaderboard>>(listKey)
      expect(cached?.data).toHaveLength(2)
    })

    const cached = queryClient.getQueryData<PaginatedResponse<Leaderboard>>(listKey)!
    expect(cached.data[0].id).toMatch(/__temp__/)
    expect(cached.total).toBe(2)

    resolveApi({ ...mockLeaderboard, id: '2' })
  })

  it('rolls back list cache on failure', async () => {
    vi.mocked(createLeaderboard).mockRejectedValue(new Error('fail'))
    queryClient.setQueryData(listKey, { data: [mockLeaderboard], total: 1 })

    const { result } = renderHook(() => useCreateLeaderboard(), { wrapper: Wrapper })
    result.current.mutate(createDto)

    await waitFor(() => expect(result.current.isError).toBe(true))

    const cached = queryClient.getQueryData<PaginatedResponse<Leaderboard>>(listKey)
    expect(cached?.data).toHaveLength(1)
    expect(cached?.total).toBe(1)
  })
})

// ─── useUpdateLeaderboard ────────────────────────────────────────────────────

describe('useUpdateLeaderboard', () => {
  const updateDto = { title: 'Updated Title' }

  it('calls updateLeaderboard with id and dto', async () => {
    vi.mocked(updateLeaderboard).mockResolvedValue({ ...mockLeaderboard, ...updateDto })
    const { result } = renderHook(() => useUpdateLeaderboard(), { wrapper: Wrapper })

    await result.current.mutateAsync({ id: '1', dto: updateDto })

    expect(updateLeaderboard).toHaveBeenCalledWith('1', updateDto)
  })

  it('shows success snackbar', async () => {
    vi.mocked(updateLeaderboard).mockResolvedValue({ ...mockLeaderboard, ...updateDto })
    const { result } = renderHook(() => useUpdateLeaderboard(), { wrapper: Wrapper })

    await result.current.mutateAsync({ id: '1', dto: updateDto })

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Leaderboard updated successfully', {
      variant: 'success',
    })
  })

  it('shows error snackbar on failure', async () => {
    vi.mocked(updateLeaderboard).mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useUpdateLeaderboard(), { wrapper: Wrapper })

    result.current.mutate({ id: '1', dto: updateDto })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Failed to update leaderboard', {
      variant: 'error',
    })
  })

  it('applies optimistic update to list and detail caches', async () => {
    let resolveApi!: (v: Leaderboard) => void
    vi.mocked(updateLeaderboard).mockReturnValue(
      new Promise<Leaderboard>((res) => {
        resolveApi = res
      }),
    )
    const detailKey = QUERY_KEYS.leaderboards.detail('1')
    queryClient.setQueryData(listKey, { data: [mockLeaderboard], total: 1 })
    queryClient.setQueryData(detailKey, mockLeaderboard)

    const { result } = renderHook(() => useUpdateLeaderboard(), { wrapper: Wrapper })
    result.current.mutate({ id: '1', dto: updateDto })

    await waitFor(() => {
      const listCache = queryClient.getQueryData<PaginatedResponse<Leaderboard>>(listKey)
      expect(listCache?.data[0].title).toBe('Updated Title')
    })
    expect(queryClient.getQueryData<Leaderboard>(detailKey)?.title).toBe('Updated Title')

    resolveApi({ ...mockLeaderboard, ...updateDto })
  })

  it('rolls back list and detail caches on failure', async () => {
    vi.mocked(updateLeaderboard).mockRejectedValue(new Error('fail'))
    const detailKey = QUERY_KEYS.leaderboards.detail('1')
    queryClient.setQueryData(listKey, { data: [mockLeaderboard], total: 1 })
    queryClient.setQueryData(detailKey, mockLeaderboard)

    const { result } = renderHook(() => useUpdateLeaderboard(), { wrapper: Wrapper })
    result.current.mutate({ id: '1', dto: updateDto })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(queryClient.getQueryData<PaginatedResponse<Leaderboard>>(listKey)?.data[0].title).toBe(
      'Test',
    )
    expect(queryClient.getQueryData<Leaderboard>(detailKey)?.title).toBe('Test')
  })
})

// ─── useDeleteLeaderboard ────────────────────────────────────────────────────

describe('useDeleteLeaderboard', () => {
  it('calls deleteLeaderboard with the id', async () => {
    vi.mocked(deleteLeaderboard).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteLeaderboard(), { wrapper: Wrapper })

    await result.current.mutateAsync('1')

    expect(deleteLeaderboard).toHaveBeenCalledWith('1', expect.any(Object))
  })

  it('shows info snackbar on success', async () => {
    vi.mocked(deleteLeaderboard).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteLeaderboard(), { wrapper: Wrapper })

    await result.current.mutateAsync('1')

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Leaderboard deleted', { variant: 'info' })
  })

  it('shows error snackbar on failure', async () => {
    vi.mocked(deleteLeaderboard).mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useDeleteLeaderboard(), { wrapper: Wrapper })

    result.current.mutate('1')

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Failed to delete leaderboard', {
      variant: 'error',
    })
  })

  it('removes item from list cache optimistically', async () => {
    let resolveApi!: () => void
    vi.mocked(deleteLeaderboard).mockReturnValue(new Promise<void>((res) => { resolveApi = res }))
    const second: Leaderboard = { ...mockLeaderboard, id: '2', title: 'Second' }
    queryClient.setQueryData(listKey, { data: [mockLeaderboard, second], total: 2 })

    const { result } = renderHook(() => useDeleteLeaderboard(), { wrapper: Wrapper })
    result.current.mutate('1')

    await waitFor(() => {
      const cached = queryClient.getQueryData<PaginatedResponse<Leaderboard>>(listKey)
      expect(cached?.data).toHaveLength(1)
    })

    const cached = queryClient.getQueryData<PaginatedResponse<Leaderboard>>(listKey)!
    expect(cached.data[0].id).toBe('2')
    expect(cached.total).toBe(1)

    resolveApi()
  })

  it('rolls back list cache on failure', async () => {
    vi.mocked(deleteLeaderboard).mockRejectedValue(new Error('fail'))
    queryClient.setQueryData(listKey, { data: [mockLeaderboard], total: 1 })

    const { result } = renderHook(() => useDeleteLeaderboard(), { wrapper: Wrapper })
    result.current.mutate('1')

    await waitFor(() => expect(result.current.isError).toBe(true))

    const cached = queryClient.getQueryData<PaginatedResponse<Leaderboard>>(listKey)
    expect(cached?.data).toHaveLength(1)
    expect(cached?.total).toBe(1)
  })
})
