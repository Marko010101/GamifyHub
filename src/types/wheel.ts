export interface WheelSegment {
  id: string
  label: string
  color: string
  weight: number
  prizeType: 'coins' | 'freeSpin' | 'bonus' | 'nothing'
  prizeAmount: number
  imageUrl: string
}

export interface Wheel {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'inactive'
  segments: WheelSegment[]
  maxSpinsPerUser: number
  spinCost: number
  backgroundColor: string
  borderColor: string
  createdAt: string
  updatedAt: string
}

export type WheelStatus = Wheel['status']
export type WheelPrizeType = WheelSegment['prizeType']

export type CreateWheelDto = Omit<Wheel, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateWheelDto = Partial<CreateWheelDto>
