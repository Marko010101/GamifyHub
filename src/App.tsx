// @assessment-v3
import { useState, useMemo } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider, CssBaseline } from '@mui/material'
import type { PaletteMode } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import { queryClient } from '@/lib/queryClient'
import { createAppTheme } from '@/theme/theme'
import { ColorModeContext } from '@/context/ColorModeContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { GlobalErrorBoundary } from '@/components/boundaries/GlobalErrorBoundary'
import { FeatureErrorBoundary } from '@/components/boundaries/FeatureErrorBoundary'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ROUTES } from '@/constants/routes'

import { LeaderboardListPage } from '@/features/leaderboard/pages/LeaderboardListPage'
import { LeaderboardCreatePage } from '@/features/leaderboard/pages/LeaderboardCreatePage'
import { LeaderboardEditPage } from '@/features/leaderboard/pages/LeaderboardEditPage'
import { LeaderboardDetailPage } from '@/features/leaderboard/pages/LeaderboardDetailPage'

import { RaffleListPage } from '@/features/raffle/pages/RaffleListPage'
import { RaffleCreatePage } from '@/features/raffle/pages/RaffleCreatePage'
import { RaffleEditPage } from '@/features/raffle/pages/RaffleEditPage'
import { RaffleDetailPage } from '@/features/raffle/pages/RaffleDetailPage'

import { WheelListPage } from '@/features/wheel/pages/WheelListPage'
import { WheelCreatePage } from '@/features/wheel/pages/WheelCreatePage'
import { WheelEditPage } from '@/features/wheel/pages/WheelEditPage'
import { WheelDetailPage } from '@/features/wheel/pages/WheelDetailPage'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.LEADERBOARD.LIST} replace /> },
      {
        path: 'leaderboards',
        element: <FeatureErrorBoundary featureName="Leaderboard"><Outlet /></FeatureErrorBoundary>,
        children: [
          { index: true, element: <LeaderboardListPage /> },
          { path: 'create', element: <LeaderboardCreatePage /> },
          { path: ':id', element: <LeaderboardDetailPage /> },
          { path: ':id/edit', element: <LeaderboardEditPage /> },
        ],
      },
      {
        path: 'raffles',
        element: <FeatureErrorBoundary featureName="Raffle"><Outlet /></FeatureErrorBoundary>,
        children: [
          { index: true, element: <RaffleListPage /> },
          { path: 'create', element: <RaffleCreatePage /> },
          { path: ':id', element: <RaffleDetailPage /> },
          { path: ':id/edit', element: <RaffleEditPage /> },
        ],
      },
      {
        path: 'wheels',
        element: <FeatureErrorBoundary featureName="Wheel"><Outlet /></FeatureErrorBoundary>,
        children: [
          { index: true, element: <WheelListPage /> },
          { path: 'create', element: <WheelCreatePage /> },
          { path: ':id', element: <WheelDetailPage /> },
          { path: ':id/edit', element: <WheelEditPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  const [mode, setMode] = useState<PaletteMode>(
    () => (localStorage.getItem('colorMode') as PaletteMode | null) ?? 'light',
  )

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light'
          localStorage.setItem('colorMode', next)
          return next
        }),
    }),
    [],
  )

  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <GlobalErrorBoundary>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            autoHideDuration={3000}
          >
            <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} />
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </GlobalErrorBoundary>
  )
}
