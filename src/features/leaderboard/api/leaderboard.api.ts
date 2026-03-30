import { httpClient } from '@/lib/httpClient'
import type { Leaderboard, CreateLeaderboardDto, UpdateLeaderboardDto } from '@/types/leaderboard'
import type { PaginatedResponse, PaginationParams } from '@/types/pagination'

interface LeaderboardListParams extends PaginationParams {
  status?: string
  title_like?: string
}

export async function fetchLeaderboards(
  params: LeaderboardListParams,
): Promise<PaginatedResponse<Leaderboard>> {
  const response = await httpClient.get<Leaderboard[]>('/leaderboards', { params })
  return {
    data: response.data,
    total: parseInt(response.headers['x-total-count'] ?? '0', 10),
  }
}

export async function fetchLeaderboard(id: string): Promise<Leaderboard> {
  const response = await httpClient.get<Leaderboard>(`/leaderboards/${id}`)
  return response.data
}

export async function createLeaderboard(dto: CreateLeaderboardDto): Promise<Leaderboard> {
  const now = new Date().toISOString()
  const response = await httpClient.post<Leaderboard>('/leaderboards', {
    ...dto,
    createdAt: now,
    updatedAt: now,
  })
  return response.data
}

export async function updateLeaderboard(
  id: string,
  dto: UpdateLeaderboardDto,
): Promise<Leaderboard> {
  const response = await httpClient.patch<Leaderboard>(`/leaderboards/${id}`, {
    ...dto,
    updatedAt: new Date().toISOString(),
  })
  return response.data
}

export async function deleteLeaderboard(id: string): Promise<void> {
  await httpClient.delete(`/leaderboards/${id}`)
}
