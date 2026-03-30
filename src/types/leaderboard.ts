export interface LeaderboardPrize {
  id: string
  rank: number
  name: string
  type: 'coins' | 'freeSpin' | 'bonus'
  amount: number
  imageUrl: string
}

export interface Leaderboard {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: 'draft' | 'active' | 'completed'
  scoringType: 'points' | 'wins' | 'wagered'
  prizes: LeaderboardPrize[]
  maxParticipants: number
  createdAt: string
  updatedAt: string
}

export type LeaderboardStatus = Leaderboard['status']
export type LeaderboardScoringType = Leaderboard['scoringType']
export type PrizeType = LeaderboardPrize['type']

export type CreateLeaderboardDto = Omit<Leaderboard, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateLeaderboardDto = Partial<CreateLeaderboardDto>
