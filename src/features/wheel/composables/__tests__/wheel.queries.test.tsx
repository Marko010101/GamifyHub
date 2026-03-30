import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useWheel } from '../useWheel'
import { useWheels } from '../useWheels'
import { fetchWheel, fetchWheels } from '../../api/wheel.api'
import { QUERY_KEYS } from '@/constants/queryKeys'
import type { Wheel } from '@/types/wheel'

vi.mock('../../api/wheel.api', () => ({
  fetchWheel: vi.fn(),
  fetchWheels: vi.fn(),
}))

const mockWheel: Wheel = {
  id: '1',
  name: 'Test Wheel',
  description: '',
  status: 'draft',
  segments: [],
  maxSpinsPerUser: 3,
  spinCost: 0,
  backgroundColor: '#FFFFFF',
  borderColor: '#000000',
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

describe('useWheel', () => {
  it('fetches wheel by id', async () => {
    vi.mocked(fetchWheel).mockResolvedValue(mockWheel)

    const { result } = renderHook(() => useWheel('1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockWheel)
    expect(fetchWheel).toHaveBeenCalledWith('1')
  })

  it('is disabled when id is empty string', () => {
    const { result } = renderHook(() => useWheel(''), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetchWheel).not.toHaveBeenCalled()
  })

  it('uses the correct detail query key', () => {
    vi.mocked(fetchWheel).mockResolvedValue(mockWheel)
    renderHook(() => useWheel('9'), { wrapper: Wrapper })

    const keys = queryClient.getQueryCache().getAll().map((q) => q.queryKey)
    expect(keys).toContainEqual(QUERY_KEYS.wheels.detail('9'))
  })
})

describe('useWheels', () => {
  it('calls fetchWheels with json-server mapped params', async () => {
    vi.mocked(fetchWheels).mockResolvedValue({ data: [], total: 0 })

    renderHook(
      () => useWheels({ page: 3, limit: 5, sort: 'name', order: 'desc', status: 'active' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(fetchWheels).toHaveBeenCalled())
    expect(fetchWheels).toHaveBeenCalledWith({
      _page: 3,
      _limit: 5,
      _sort: 'name',
      _order: 'desc',
      status: 'active',
    })
  })

  it('converts empty status string to undefined', async () => {
    vi.mocked(fetchWheels).mockResolvedValue({ data: [], total: 0 })

    renderHook(() => useWheels({ page: 1, limit: 10, status: '' }), { wrapper: Wrapper })

    await waitFor(() => expect(fetchWheels).toHaveBeenCalled())
    expect(fetchWheels).toHaveBeenCalledWith(expect.objectContaining({ status: undefined }))
  })

  it('includes all params in the query key', () => {
    vi.mocked(fetchWheels).mockResolvedValue({ data: [], total: 0 })
    const params = { page: 1, limit: 10 }

    renderHook(() => useWheels(params), { wrapper: Wrapper })

    const [cachedKey] = queryClient.getQueryCache().getAll().map((q) => q.queryKey)
    expect(cachedKey).toEqual(QUERY_KEYS.wheels.list(params as never))
  })

  it('returns data from the API', async () => {
    vi.mocked(fetchWheels).mockResolvedValue({ data: [mockWheel], total: 1 })

    const { result } = renderHook(() => useWheels({ page: 1, limit: 10 }), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
    expect(result.current.data?.total).toBe(1)
  })
})
