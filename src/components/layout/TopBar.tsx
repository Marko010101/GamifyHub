import { AppBar, Breadcrumbs, IconButton, Link, Toolbar, Tooltip, Typography, useTheme } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useColorMode } from '@/context/ColorModeContext'

interface BreadcrumbItem {
  label: string
  to?: string
}

const SEGMENT_LABELS: Record<string, string> = {
  leaderboards: 'Leaderboards',
  raffles: 'Raffles',
  wheels: 'Wheels',
  create: 'Create',
  edit: 'Edit',
}

const FEATURE_ROOTS: Record<string, string> = {
  leaderboards: ROUTES.LEADERBOARD.LIST,
  raffles: ROUTES.RAFFLE.LIST,
  wheels: ROUTES.WHEEL.LIST,
}

function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return []

  const crumbs: BreadcrumbItem[] = []
  const [feature, second, third] = segments

  // Feature root (e.g. "leaderboards")
  const featureLabel = SEGMENT_LABELS[feature]
  if (!featureLabel) return []
  crumbs.push({ label: featureLabel, to: FEATURE_ROOTS[feature] })

  if (!second) return crumbs

  // "create"
  if (second === 'create') {
    crumbs.push({ label: 'Create' })
    return crumbs
  }

  // ":id/edit" or just ":id"
  if (third === 'edit') {
    crumbs.push({ label: 'Detail', to: `/${feature}/${second}` })
    crumbs.push({ label: 'Edit' })
  } else {
    crumbs.push({ label: 'Detail' })
  }

  return crumbs
}

interface TopBarProps {
  height: number
}

export function TopBar({ height }: TopBarProps) {
  const { pathname } = useLocation()
  const breadcrumbs = buildBreadcrumbs(pathname)
  const { toggleColorMode } = useColorMode()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        ml: '240px',
        width: 'calc(100% - 240px)',
        height,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ height: '100%' }}>
        {breadcrumbs.length > 0 ? (
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            {breadcrumbs.map((crumb, index) =>
              index < breadcrumbs.length - 1 && crumb.to ? (
                <Link
                  key={index}
                  component={RouterLink}
                  to={crumb.to}
                  underline="hover"
                  color="inherit"
                  sx={{ fontSize: '0.875rem' }}
                >
                  {crumb.label}
                </Link>
              ) : (
                <Typography
                  key={index}
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                >
                  {crumb.label}
                </Typography>
              ),
            )}
          </Breadcrumbs>
        ) : (
          <Typography variant="h6" fontWeight={600}>
            Admin Panel
          </Typography>
        )}
        <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} sx={{ ml: 'auto' }}>
          <IconButton onClick={toggleColorMode} color="inherit" aria-label="toggle dark mode">
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}
