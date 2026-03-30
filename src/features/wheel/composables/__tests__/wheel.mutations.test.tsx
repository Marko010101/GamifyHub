import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useCreateWheel } from '../useCreateWheel'
import { useUpdateWheel } from '../useUpdateWheel'
import { useDeleteWheel } from '../useDeleteWheel'
import { createWheel, updateWheel, deleteWheel } from '../../api/wheel.api'
import { QUERY_KEYS } from '@/constants/queryKeys'
import type { Wheel, CreateWheelDto } from '@/types/wheel'
import type { PaginatedResponse } from '@/types/pagination'

const mockEnqueueSnackbar = vi.fn()
vi.mock('notistack', () => ({ useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar }) }))
vi.mock('../../api/wheel.api', () => ({
  createWheel: vi.fn(),
  updateWheel: vi.fn(),
  deleteWheel: vi.fn(),
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

const createDto: CreateWheelDto = {
  name: 'New Wheel',
  description: '',
  status: 'draft',
  segments: [],
  maxSpinsPerUser: 1,
  spinCost: 0,
  backgroundColor: '#FFFFFF',
  borderColor: '#000000',
}

const listKey = QUERY_KEYS.wheels.list({})

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

// ─── useCreateWheel ───────────────────────────────────────────────────────────

describe('useCreateWheel', () => {
  it('calls createWheel with the dto', async () => {
    vi.mocked(createWheel).mockResolvedValue(mockWheel)
    const { result } = renderHook(() => useCreateWheel(), { wrapper: Wrapper })

    await result.current.mutateAsync(createDto)

    expect(createWheel).toHaveBeenCalledWith(createDto, expect.any(Object))
  })

  it('shows success snackbar', async () => {
    vi.mocked(createWheel).mockResolvedValue(mockWheel)
    const { result } = renderHook(() => useCreateWheel(), { wrapper: Wrapper })

    await result.current.mutateAsync(createDto)

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Wheel created successfully', {
      variant: 'success',
    })
  })

  it('shows error snackbar on failure', async () => {
    vi.mocked(createWheel).mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useCreateWheel(), { wrapper: Wrapper })

    result.current.mutate(createDto)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Failed to create wheel', {
      variant: 'error',
    })
  })

  it('inserts optimistic item at top of list before API resolves', async () => {
    let resolveApi!: (v: Wheel) => void
    vi.mocked(createWheel).mockReturnValue(
      new Promise<Wheel>((res) => {
        resolveApi = res
      }),
    )
    queryClient.setQueryData(listKey, { data: [mockWheel], total: 1 })

    const { result } = renderHook(() => useCreateWheel(), { wrapper: Wrapper })
    result.current.mutate(createDto)

    await waitFor(() => {
      const cached = queryClient.getQueryData<PaginatedResponse<Wheel>>(listKey)
      expect(cached?.data).toHaveLength(2)
    })

    const cached = queryClient.getQueryData<PaginatedResponse<Wheel>>(listKey)!
    expect(cached.data[0].id).toMatch(/__temp__/)
    expect(cached.total).toBe(2)

    resolveApi({ ...mockWheel, id: '2' })
  })

  it('rolls back list cache on failure', async () => {
    vi.mocked(createWheel).mockRejectedValue(new Error('fail'))
    queryClient.setQueryData(listKey, { data: [mockWheel], total: 1 })

    const { result } = renderHook(() => useCreateWheel(), { wrapper: Wrapper })
    result.current.mutate(createDto)

    await waitFor(() => expect(result.current.isError).toBe(true))

    const cached = queryClient.getQueryData<PaginatedResponse<Wheel>>(listKey)
    expect(cached?.data).toHaveLength(1)
    expect(cached?.total).toBe(1)
  })
})

// ─── useUpdateWheel ───────────────────────────────────────────────────────────

describe('useUpdateWheel', () => {
  const updateDto = { name: 'Updated Wheel' }

  it('calls updateWheel with id and dto', async () => {
    vi.mocked(updateWheel).mockResolvedValue({ ...mockWheel, ...updateDto })
    const { result } = renderHook(() => useUpdateWheel(), { wrapper: Wrapper })

    await result.current.mutateAsync({ id: '1', dto: updateDto })

    expect(updateWheel).toHaveBeenCalledWith('1', updateDto)
  })

  it('shows success snackbar', async () => {
    vi.mocked(updateWheel).mockResolvedValue({ ...mockWheel, ...updateDto })
    const { result } = renderHook(() => useUpdateWheel(), { wrapper: Wrapper })

    await result.current.mutateAsync({ id: '1', dto: updateDto })

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Wheel updated successfully', {
      variant: 'success',
    })
  })

  it('shows error snackbar on failure', async () => {
    vi.mocked(updateWheel).mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useUpdateWheel(), { wrapper: Wrapper })

    result.current.mutate({ id: '1', dto: updateDto })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Failed to update wheel', {
      variant: 'error',
    })
  })

  it('applies optimistic update to list and detail caches', async () => {
    let resolveApi!: (v: Wheel) => void
    vi.mocked(updateWheel).mockReturnValue(
      new Promise<Wheel>((res) => {
        resolveApi = res
      }),
    )
    const detailKey = QUERY_KEYS.wheels.detail('1')
    queryClient.setQueryData(listKey, { data: [mockWheel], total: 1 })
    queryClient.setQueryData(detailKey, mockWheel)

    const { result } = renderHook(() => useUpdateWheel(), { wrapper: Wrapper })
    result.current.mutate({ id: '1', dto: updateDto })

    await waitFor(() => {
      const listCache = queryClient.getQueryData<PaginatedResponse<Wheel>>(listKey)
      expect(listCache?.data[0].name).toBe('Updated Wheel')
    })
    expect(queryClient.getQueryData<Wheel>(detailKey)?.name).toBe('Updated Wheel')

    resolveApi({ ...mockWheel, ...updateDto })
  })

  it('rolls back list and detail caches on failure', async () => {
    vi.mocked(updateWheel).mockRejectedValue(new Error('fail'))
    const detailKey = QUERY_KEYS.wheels.detail('1')
    queryClient.setQueryData(listKey, { data: [mockWheel], total: 1 })
    queryClient.setQueryData(detailKey, mockWheel)

    const { result } = renderHook(() => useUpdateWheel(), { wrapper: Wrapper })
    result.current.mutate({ id: '1', dto: updateDto })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(queryClient.getQueryData<PaginatedResponse<Wheel>>(listKey)?.data[0].name).toBe(
      'Test Wheel',
    )
    expect(queryClient.getQueryData<Wheel>(detailKey)?.name).toBe('Test Wheel')
  })
})

// ─── useDeleteWheel ───────────────────────────────────────────────────────────

describe('useDeleteWheel', () => {
  it('calls deleteWheel with the id', async () => {
    vi.mocked(deleteWheel).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteWheel(), { wrapper: Wrapper })

    await result.current.mutateAsync('1')

    expect(deleteWheel).toHaveBeenCalledWith('1', expect.any(Object))
  })

  it('shows info snackbar on success', async () => {
    vi.mocked(deleteWheel).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteWheel(), { wrapper: Wrapper })

    await result.current.mutateAsync('1')

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Wheel deleted', { variant: 'info' })
  })

  it('shows error snackbar on failure', async () => {
    vi.mocked(deleteWheel).mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useDeleteWheel(), { wrapper: Wrapper })

    result.current.mutate('1')

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Failed to delete wheel', {
      variant: 'error',
    })
  })

  it('removes item from list cache optimistically', async () => {
    let resolveApi!: () => void
    vi.mocked(deleteWheel).mockReturnValue(new Promise<void>((res) => { resolveApi = res }))
    const second: Wheel = { ...mockWheel, id: '2', name: 'Second' }
    queryClient.setQueryData(listKey, { data: [mockWheel, second], total: 2 })

    const { result } = renderHook(() => useDeleteWheel(), { wrapper: Wrapper })
    result.current.mutate('1')

    await waitFor(() => {
      const cached = queryClient.getQueryData<PaginatedResponse<Wheel>>(listKey)
      expect(cached?.data).toHaveLength(1)
    })

    const cached = queryClient.getQueryData<PaginatedResponse<Wheel>>(listKey)!
    expect(cached.data[0].id).toBe('2')
    expect(cached.total).toBe(1)

    resolveApi()
  })

  it('rolls back list cache on failure', async () => {
    vi.mocked(deleteWheel).mockRejectedValue(new Error('fail'))
    queryClient.setQueryData(listKey, { data: [mockWheel], total: 1 })

    const { result } = renderHook(() => useDeleteWheel(), { wrapper: Wrapper })
    result.current.mutate('1')

    await waitFor(() => expect(result.current.isError).toBe(true))

    const cached = queryClient.getQueryData<PaginatedResponse<Wheel>>(listKey)
    expect(cached?.data).toHaveLength(1)
    expect(cached?.total).toBe(1)
  })
})
