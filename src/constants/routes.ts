export const ROUTES = {
  HOME: '/',
  LEADERBOARD: {
    LIST: '/leaderboards',
    CREATE: '/leaderboards/create',
    DETAIL: (id = ':id') => `/leaderboards/${id}`,
    EDIT: (id = ':id') => `/leaderboards/${id}/edit`,
  },
  RAFFLE: {
    LIST: '/raffles',
    CREATE: '/raffles/create',
    DETAIL: (id = ':id') => `/raffles/${id}`,
    EDIT: (id = ':id') => `/raffles/${id}/edit`,
  },
  WHEEL: {
    LIST: '/wheels',
    CREATE: '/wheels/create',
    DETAIL: (id = ':id') => `/wheels/${id}`,
    EDIT: (id = ':id') => `/wheels/${id}/edit`,
  },
} as const
