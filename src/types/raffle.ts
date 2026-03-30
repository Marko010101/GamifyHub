export interface RafflePrize {
  id: string
  name: string
  type: 'coins' | 'freeSpin' | 'bonus'
  amount: number
  quantity: number
  imageUrl: string
}

export interface Raffle {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  drawDate: string
  status: 'draft' | 'active' | 'drawn' | 'cancelled'
  ticketPrice: number
  maxTicketsPerUser: number
  prizes: RafflePrize[]
  totalTicketLimit: number | null
  createdAt: string
  updatedAt: string
}

export type RaffleStatus = Raffle['status']
export type RafflePrizeType = RafflePrize['type']

export type CreateRaffleDto = Omit<Raffle, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateRaffleDto = Partial<CreateRaffleDto>
