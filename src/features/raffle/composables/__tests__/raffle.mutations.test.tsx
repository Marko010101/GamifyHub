import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useCreateRaffle } from '../useCreateRaffle'
import { useUpdateRaffle } from '../useUpdateRaffle'
import { useDeleteRaffle } from '../useDeleteRaffle'
import { createRaffle, updateRaffle, deleteRaffle } from '../../api/raffle.api'
import { QUERY_KEYS } from '@/constants/queryKeys'
import type { Raffle, CreateRaffleDto } from '@/types/raffle'
import type { PaginatedResponse } from '@/types/pagination'

const mockEnqueueSnackbar = vi.fn()
vi.mock('notistack', () => ({ useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar }) }))
vi.mock('../../api/raffle.api', () => ({
  createRaffle: vi.fn(),
  updateRaffle: vi.fn(),
  deleteRaffle: vi.fn(),
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

const createDto: CreateRaffleDto = {
  name: 'New Raffle',
  description: '',
  startDate: '2024-03-01',
  endDate: '2024-03-31',
  drawDate: '2024-04-01',
  status: 'draft',
  ticketPrice: 5,
  maxTicketsPerUser: 3,
  prizes: [],
  totalTicketLimit: null,
}

const listKey = QUERY_KEYS.raffles.list({})

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

// ─── useCreateRaffle ─────────────────────────────────────────────────────────

describe('useCreateRaffle', () => {
  it('calls createRaffle with the dto', async () => {
    vi.mocked(createRaffle).mockResolvedValue(mockRaffle)
    const { result } = renderHook(() => useCreateRaffle(), { wrapper: Wrapper })

    await result.current.mutateAsync(createDto)

    expect(createRaffle).toHaveBeenCalledWith(createDto, expect.any(Object))
  })

  it('shows success snackbar', async () => {
    vi.mocked(createRaffle).mockResolvedValue(mockRaffle)
    const { result } = renderHook(() => useCreateRaffle(), { wrapper: Wrapper })

    await result.current.mutateAsync(createDto)

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Raffle created successfully', {
      variant: 'success',
    })
  })

  it('shows error snackbar on failure', async () => {
    vi.mocked(createRaffle).mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useCreateRaffle(), { wrapper: Wrapper })

    result.current.mutate(createDto)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Failed to create raffle', {
      variant: 'error',
    })
  })

  it('inserts optimistic item at top of list before API resolves', async () => {
    let resolveApi!: (v: Raffle) => void
    vi.mocked(createRaffle).mockReturnValue(
      new Promise<Raffle>((res) => {
        resolveApi = res
      }),
    )
    queryClient.setQueryData(listKey, { data: [mockRaffle], total: 1 })

    const { result } = renderHook(() => useCreateRaffle(), { wrapper: Wrapper })
    result.current.mutate(createDto)

    await waitFor(() => {
      const cached = queryClient.getQueryData<PaginatedResponse<Raffle>>(listKey)
      expect(cached?.data).toHaveLength(2)
    })

    const cached = queryClient.getQueryData<PaginatedResponse<Raffle>>(listKey)!
    expect(cached.data[0].id).toMatch(/__temp__/)
    expect(cached.total).toBe(2)

    resolveApi({ ...mockRaffle, id: '2' })
  })

  it('rolls back list cache on failure', async () => {
    vi.mocked(createRaffle).mockRejectedValue(new Error('fail'))
    queryClient.setQueryData(listKey, { data: [mockRaffle], total: 1 })

    const { result } = renderHook(() => useCreateRaffle(), { wrapper: Wrapper })
    result.current.mutate(createDto)

    await waitFor(() => expect(result.current.isError).toBe(true))

    const cached = queryClient.getQueryData<PaginatedResponse<Raffle>>(listKey)
    expect(cached?.data).toHaveLength(1)
    expect(cached?.total).toBe(1)
  })
})

// ─── useUpdateRaffle ─────────────────────────────────────────────────────────

describe('useUpdateRaffle', () => {
  const updateDto = { name: 'Updated Raffle' }

  it('calls updateRaffle with id and dto', async () => {
    vi.mocked(updateRaffle).mockResolvedValue({ ...mockRaffle, ...updateDto })
    const { result } = renderHook(() => useUpdateRaffle(), { wrapper: Wrapper })

    await result.current.mutateAsync({ id: '1', dto: updateDto })

    expect(updateRaffle).toHaveBeenCalledWith('1', updateDto)
  })

  it('shows success snackbar', async () => {
    vi.mocked(updateRaffle).mockResolvedValue({ ...mockRaffle, ...updateDto })
    const { result } = renderHook(() => useUpdateRaffle(), { wrapper: Wrapper })

    await result.current.mutateAsync({ id: '1', dto: updateDto })

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Raffle updated successfully', {
      variant: 'success',
    })
  })

  it('shows error snackbar on failure', async () => {
    vi.mocked(updateRaffle).mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useUpdateRaffle(), { wrapper: Wrapper })

    result.current.mutate({ id: '1', dto: updateDto })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Failed to update raffle', {
      variant: 'error',
    })
  })

  it('applies optimistic update to list and detail caches', async () => {
    let resolveApi!: (v: Raffle) => void
    vi.mocked(updateRaffle).mockReturnValue(
      new Promise<Raffle>((res) => {
        resolveApi = res
      }),
    )
    const detailKey = QUERY_KEYS.raffles.detail('1')
    queryClient.setQueryData(listKey, { data: [mockRaffle], total: 1 })
    queryClient.setQueryData(detailKey, mockRaffle)

    const { result } = renderHook(() => useUpdateRaffle(), { wrapper: Wrapper })
    result.current.mutate({ id: '1', dto: updateDto })

    await waitFor(() => {
      const listCache = queryClient.getQueryData<PaginatedResponse<Raffle>>(listKey)
      expect(listCache?.data[0].name).toBe('Updated Raffle')
    })
    expect(queryClient.getQueryData<Raffle>(detailKey)?.name).toBe('Updated Raffle')

    resolveApi({ ...mockRaffle, ...updateDto })
  })

  it('rolls back list and detail caches on failure', async () => {
    vi.mocked(updateRaffle).mockRejectedValue(new Error('fail'))
    const detailKey = QUERY_KEYS.raffles.detail('1')
    queryClient.setQueryData(listKey, { data: [mockRaffle], total: 1 })
    queryClient.setQueryData(detailKey, mockRaffle)

    const { result } = renderHook(() => useUpdateRaffle(), { wrapper: Wrapper })
    result.current.mutate({ id: '1', dto: updateDto })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(queryClient.getQueryData<PaginatedResponse<Raffle>>(listKey)?.data[0].name).toBe(
      'Test Raffle',
    )
    expect(queryClient.getQueryData<Raffle>(detailKey)?.name).toBe('Test Raffle')
  })
})

// ─── useDeleteRaffle ─────────────────────────────────────────────────────────

describe('useDeleteRaffle', () => {
  it('calls deleteRaffle with the id', async () => {
    vi.mocked(deleteRaffle).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteRaffle(), { wrapper: Wrapper })

    await result.current.mutateAsync('1')

    expect(deleteRaffle).toHaveBeenCalledWith('1', expect.any(Object))
  })

  it('shows info snackbar on success', async () => {
    vi.mocked(deleteRaffle).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteRaffle(), { wrapper: Wrapper })

    await result.current.mutateAsync('1')

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Raffle deleted', { variant: 'info' })
  })

  it('shows error snackbar on failure', async () => {
    vi.mocked(deleteRaffle).mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useDeleteRaffle(), { wrapper: Wrapper })

    result.current.mutate('1')

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Failed to delete raffle', {
      variant: 'error',
    })
  })

  it('removes item from list cache optimistically', async () => {
    let resolveApi!: () => void
    vi.mocked(deleteRaffle).mockReturnValue(new Promise<void>((res) => { resolveApi = res }))
    const second: Raffle = { ...mockRaffle, id: '2', name: 'Second' }
    queryClient.setQueryData(listKey, { data: [mockRaffle, second], total: 2 })

    const { result } = renderHook(() => useDeleteRaffle(), { wrapper: Wrapper })
    result.current.mutate('1')

    await waitFor(() => {
      const cached = queryClient.getQueryData<PaginatedResponse<Raffle>>(listKey)
      expect(cached?.data).toHaveLength(1)
    })

    const cached = queryClient.getQueryData<PaginatedResponse<Raffle>>(listKey)!
    expect(cached.data[0].id).toBe('2')
    expect(cached.total).toBe(1)

    resolveApi()
  })

  it('rolls back list cache on failure', async () => {
    vi.mocked(deleteRaffle).mockRejectedValue(new Error('fail'))
    queryClient.setQueryData(listKey, { data: [mockRaffle], total: 1 })

    const { result } = renderHook(() => useDeleteRaffle(), { wrapper: Wrapper })
    result.current.mutate('1')

    await waitFor(() => expect(result.current.isError).toBe(true))

    const cached = queryClient.getQueryData<PaginatedResponse<Raffle>>(listKey)
    expect(cached?.data).toHaveLength(1)
    expect(cached?.total).toBe(1)
  })
})
