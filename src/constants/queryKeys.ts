export const QUERY_KEYS = {
  leaderboards: {
    all: ['leaderboards'] as const,
    lists: () => [...QUERY_KEYS.leaderboards.all, 'list'] as const,
    list: (params: Record<string, unknown>) =>
      [...QUERY_KEYS.leaderboards.lists(), params] as const,
    details: () => [...QUERY_KEYS.leaderboards.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.leaderboards.details(), id] as const,
  },
  raffles: {
    all: ['raffles'] as const,
    lists: () => [...QUERY_KEYS.raffles.all, 'list'] as const,
    list: (params: Record<string, unknown>) =>
      [...QUERY_KEYS.raffles.lists(), params] as const,
    details: () => [...QUERY_KEYS.raffles.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.raffles.details(), id] as const,
  },
  wheels: {
    all: ['wheels'] as const,
    lists: () => [...QUERY_KEYS.wheels.all, 'list'] as const,
    list: (params: Record<string, unknown>) =>
      [...QUERY_KEYS.wheels.lists(), params] as const,
    details: () => [...QUERY_KEYS.wheels.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.wheels.details(), id] as const,
  },
} as const
