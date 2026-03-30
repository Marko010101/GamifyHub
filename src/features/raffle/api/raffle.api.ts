import { httpClient } from '@/lib/httpClient'
import type { Raffle, CreateRaffleDto, UpdateRaffleDto } from '@/types/raffle'
import type { PaginatedResponse, PaginationParams } from '@/types/pagination'

interface RaffleListParams extends PaginationParams {
  status?: string
  startDate_gte?: string
  endDate_lte?: string
  name_like?: string
}

export async function fetchRaffles(
  params: RaffleListParams,
): Promise<PaginatedResponse<Raffle>> {
  const response = await httpClient.get<Raffle[]>('/raffles', { params })
  return {
    data: response.data,
    total: parseInt(response.headers['x-total-count'] ?? '0', 10),
  }
}

export async function fetchRaffle(id: string): Promise<Raffle> {
  const response = await httpClient.get<Raffle>(`/raffles/${id}`)
  return response.data
}

export async function createRaffle(dto: CreateRaffleDto): Promise<Raffle> {
  const now = new Date().toISOString()
  const response = await httpClient.post<Raffle>('/raffles', {
    ...dto,
    createdAt: now,
    updatedAt: now,
  })
  return response.data
}

export async function updateRaffle(id: string, dto: UpdateRaffleDto): Promise<Raffle> {
  const response = await httpClient.patch<Raffle>(`/raffles/${id}`, {
    ...dto,
    updatedAt: new Date().toISOString(),
  })
  return response.data
}

export async function deleteRaffle(id: string): Promise<void> {
  await httpClient.delete(`/raffles/${id}`)
}
