import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useLeaderboard } from '../useLeaderboard'
import { useLeaderboards } from '../useLeaderboards'
import { fetchLeaderboard, fetchLeaderboards } from '../../api/leaderboard.api'
import { QUERY_KEYS } from '@/constants/queryKeys'
import type { Leaderboard } from '@/types/leaderboard'

vi.mock('../../api/leaderboard.api', () => ({
  fetchLeaderboard: vi.fn(),
  fetchLeaderboards: vi.fn(),
}))

const mockLeaderboard: Leaderboard = {
  id: '1',
  title: 'Test Leaderboard',
  description: '',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  status: 'active',
  scoringType: 'points',
  prizes: [],
  maxParticipants: 10,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

let queryClient: QueryClient

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  vi.clearAllMocks()
})

function Wrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useLeaderboard', () => {
  it('fetches leaderboard by id', async () => {
    vi.mocked(fetchLeaderboard).mockResolvedValue(mockLeaderboard)

    const { result } = renderHook(() => useLeaderboard('1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockLeaderboard)
    expect(fetchLeaderboard).toHaveBeenCalledWith('1')
  })

  it('is disabled when id is empty string', () => {
    const { result } = renderHook(() => useLeaderboard(''), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetchLeaderboard).not.toHaveBeenCalled()
  })

  it('uses the correct detail query key', () => {
    vi.mocked(fetchLeaderboard).mockResolvedValue(mockLeaderboard)
    renderHook(() => useLeaderboard('42'), { wrapper: Wrapper })

    const keys = queryClient.getQueryCache().getAll().map((q) => q.queryKey)
    expect(keys).toContainEqual(QUERY_KEYS.leaderboards.detail('42'))
  })
})

describe('useLeaderboards', () => {
  it('calls fetchLeaderboards with json-server mapped params', async () => {
    vi.mocked(fetchLeaderboards).mockResolvedValue({ data: [], total: 0 })

    renderHook(
      () =>
        useLeaderboards({ page: 2, limit: 20, sort: 'title', order: 'asc', status: 'active' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(fetchLeaderboards).toHaveBeenCalled())
    expect(fetchLeaderboards).toHaveBeenCalledWith({
      _page: 2,
      _limit: 20,
      _sort: 'title',
      _order: 'asc',
      status: 'active',
    })
  })

  it('converts empty status string to undefined', async () => {
    vi.mocked(fetchLeaderboards).mockResolvedValue({ data: [], total: 0 })

    renderHook(() => useLeaderboards({ page: 1, limit: 10, status: '' }), { wrapper: Wrapper })

    await waitFor(() => expect(fetchLeaderboards).toHaveBeenCalled())
    expect(fetchLeaderboards).toHaveBeenCalledWith(expect.objectContaining({ status: undefined }))
  })

  it('includes all params in the query key', () => {
    vi.mocked(fetchLeaderboards).mockResolvedValue({ data: [], total: 0 })
    const params = { page: 1, limit: 10, status: 'draft' }

    renderHook(() => useLeaderboards(params), { wrapper: Wrapper })

    const [cachedKey] = queryClient.getQueryCache().getAll().map((q) => q.queryKey)
    expect(cachedKey).toEqual(QUERY_KEYS.leaderboards.list(params as never))
  })

  it('returns data from the API', async () => {
    vi.mocked(fetchLeaderboards).mockResolvedValue({ data: [mockLeaderboard], total: 1 })

    const { result } = renderHook(() => useLeaderboards({ page: 1, limit: 10 }), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
    expect(result.current.data?.total).toBe(1)
  })
})
