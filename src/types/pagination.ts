export interface PaginationParams {
  _page: number
  _limit: number
  _sort?: string
  _order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
}
