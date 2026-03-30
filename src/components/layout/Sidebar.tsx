import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import LeaderboardIcon from '@mui/icons-material/Leaderboard'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import CasinoIcon from '@mui/icons-material/Casino'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Leaderboards', path: ROUTES.LEADERBOARD.LIST, icon: <LeaderboardIcon /> },
  { label: 'Raffles', path: ROUTES.RAFFLE.LIST, icon: <ConfirmationNumberIcon /> },
  { label: 'Wheels', path: ROUTES.WHEEL.LIST, icon: <CasinoIcon /> },
]

interface SidebarProps {
  width: number
}

export function Sidebar({ width }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          bgcolor: 'primary.dark',
          color: 'primary.contrastText',
        },
      }}
    >
      <Box
        component="a"
        onClick={() => navigate(ROUTES.LEADERBOARD.LIST)}
        sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', textDecoration: 'none' }}
      >
        <CasinoIcon sx={{ fontSize: 32, color: 'secondary.light' }} />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>
          GamifyHub
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
      <List sx={{ pt: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1,
                  my: 0.25,
                  borderRadius: 2,
                  bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  transition: 'background-color 0.15s',
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'secondary.light' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? 'white' : 'rgba(255,255,255,0.8)',
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Drawer>
  )
}
