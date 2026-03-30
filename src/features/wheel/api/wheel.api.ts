import { httpClient } from '@/lib/httpClient'
import type { Wheel, CreateWheelDto, UpdateWheelDto } from '@/types/wheel'
import type { PaginatedResponse, PaginationParams } from '@/types/pagination'

interface WheelListParams extends PaginationParams {
  status?: string
}

export async function fetchWheels(
  params: WheelListParams,
): Promise<PaginatedResponse<Wheel>> {
  const response = await httpClient.get<Wheel[]>('/wheels', { params })
  return {
    data: response.data,
    total: parseInt(response.headers['x-total-count'] ?? '0', 10),
  }
}

export async function fetchWheel(id: string): Promise<Wheel> {
  const response = await httpClient.get<Wheel>(`/wheels/${id}`)
  return response.data
}

export async function createWheel(dto: CreateWheelDto): Promise<Wheel> {
  const now = new Date().toISOString()
  const response = await httpClient.post<Wheel>('/wheels', {
    ...dto,
    createdAt: now,
    updatedAt: now,
  })
  return response.data
}

export async function updateWheel(id: string, dto: UpdateWheelDto): Promise<Wheel> {
  const response = await httpClient.patch<Wheel>(`/wheels/${id}`, {
    ...dto,
    updatedAt: new Date().toISOString(),
  })
  return response.data
}

export async function deleteWheel(id: string): Promise<void> {
  await httpClient.delete(`/wheels/${id}`)
}
