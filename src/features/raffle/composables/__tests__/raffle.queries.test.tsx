import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useRaffle } from '../useRaffle'
import { useRaffles } from '../useRaffles'
import { fetchRaffle, fetchRaffles } from '../../api/raffle.api'
import { QUERY_KEYS } from '@/constants/queryKeys'
import type { Raffle } from '@/types/raffle'

vi.mock('../../api/raffle.api', () => ({
  fetchRaffle: vi.fn(),
  fetchRaffles: vi.fn(),
}))

const mockRaffle: Raffle = {
  id: '1',
  name: 'Test Raffle',
  description: '',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  drawDate: '2024-02-01',
  status: 'draft',
  ticketPrice: 10,
  maxTicketsPerUser: 5,
  prizes: [],
  totalTicketLimit: null,
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

describe('useRaffle', () => {
  it('fetches raffle by id', async () => {
    vi.mocked(fetchRaffle).mockResolvedValue(mockRaffle)

    const { result } = renderHook(() => useRaffle('1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockRaffle)
    expect(fetchRaffle).toHaveBeenCalledWith('1')
  })

  it('is disabled when id is empty string', () => {
    const { result } = renderHook(() => useRaffle(''), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetchRaffle).not.toHaveBeenCalled()
  })

  it('uses the correct detail query key', () => {
    vi.mocked(fetchRaffle).mockResolvedValue(mockRaffle)
    renderHook(() => useRaffle('7'), { wrapper: Wrapper })

    const keys = queryClient.getQueryCache().getAll().map((q) => q.queryKey)
    expect(keys).toContainEqual(QUERY_KEYS.raffles.detail('7'))
  })
})

describe('useRaffles', () => {
  it('calls fetchRaffles with json-server mapped params', async () => {
    vi.mocked(fetchRaffles).mockResolvedValue({ data: [], total: 0 })

    renderHook(
      () =>
        useRaffles({ page: 1, limit: 10, sort: 'name', order: 'desc', status: 'active' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(fetchRaffles).toHaveBeenCalled())
    expect(fetchRaffles).toHaveBeenCalledWith({
      _page: 1,
      _limit: 10,
      _sort: 'name',
      _order: 'desc',
      status: 'active',
      startDate_gte: undefined,
      endDate_lte: undefined,
    })
  })

  it('maps startDateFrom and endDateTo to json-server filter params', async () => {
    vi.mocked(fetchRaffles).mockResolvedValue({ data: [], total: 0 })

    renderHook(
      () =>
        useRaffles({
          page: 1,
          limit: 10,
          startDateFrom: '2024-01-01',
          endDateTo: '2024-12-31',
        }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(fetchRaffles).toHaveBeenCalled())
    expect(fetchRaffles).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate_gte: '2024-01-01',
        endDate_lte: '2024-12-31',
      }),
    )
  })

  it('converts empty status string to undefined', async () => {
    vi.mocked(fetchRaffles).mockResolvedValue({ data: [], total: 0 })

    renderHook(() => useRaffles({ page: 1, limit: 10, status: '' }), { wrapper: Wrapper })

    await waitFor(() => expect(fetchRaffles).toHaveBeenCalled())
    expect(fetchRaffles).toHaveBeenCalledWith(expect.objectContaining({ status: undefined }))
  })

  it('includes all params in the query key', () => {
    vi.mocked(fetchRaffles).mockResolvedValue({ data: [], total: 0 })
    const params = { page: 1, limit: 10 }

    renderHook(() => useRaffles(params), { wrapper: Wrapper })

    const [cachedKey] = queryClient.getQueryCache().getAll().map((q) => q.queryKey)
    expect(cachedKey).toEqual(QUERY_KEYS.raffles.list(params as never))
  })
})
