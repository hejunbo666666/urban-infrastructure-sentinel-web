import { BottomNavigation, BottomNavigationAction, Box, Container, Paper, Typography } from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import MapIcon from '@mui/icons-material/Map'
import PersonIcon from '@mui/icons-material/Person'
import { useEffect, useMemo } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useReportsContext } from '../store/reports-context'

const paths = ['/report', '/map', '/my']

export function MobileLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, refreshReports } = useReportsContext()
  const value = useMemo(() => {
    const idx = paths.findIndex((path) => location.pathname.startsWith(path))
    return idx < 0 ? 0 : idx
  }, [location.pathname])

  useEffect(() => {
    if (!currentUser) return
    refreshReports().catch(() => undefined)
  }, [location.pathname, currentUser, refreshReports])

  return (
    <Container
      maxWidth="sm"
      disableGutters
      sx={{
        pt: 0,
        // Reserve space for fixed bottom navigation + iOS safe area.
        pb: 'calc(84px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          mb: 1.5,
          borderRadius: 0,
          borderLeft: 0,
          borderRight: 0,
          borderTop: 0,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Urban Infrastructure Sentinel"
            sx={{
              width: 78,
              height: 78,
              objectFit: 'contain',
              display: 'block',
              flexShrink: 0,
              bgcolor: '#fff',
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              fontSize={22}
              fontWeight={700}
              lineHeight={1.2}
              sx={{
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              Urban Infrastructure Sentinel
            </Typography>
            <Typography fontSize={12.5} color="text.secondary" sx={{ mt: 0.25 }}>
              Urban infrastructure inspection assistant
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ px: 2 }}>
        <Outlet />
      </Box>

      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          pb: 'env(safe-area-inset-bottom, 0px)',
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <BottomNavigation
            showLabels
            value={value}
            onChange={(_, next) => navigate(paths[next])}
            sx={{ height: 64 }}
          >
            <BottomNavigationAction
              label="Report"
              icon={<AssignmentIcon />}
              component={NavLink}
              to="/report"
              sx={{ minWidth: 0 }}
            />
            <BottomNavigationAction
              label="Map"
              icon={<MapIcon />}
              component={NavLink}
              to="/map"
              sx={{ minWidth: 0 }}
            />
            <BottomNavigationAction
              label="My"
              icon={<PersonIcon />}
              component={NavLink}
              to="/my"
              sx={{ minWidth: 0 }}
            />
          </BottomNavigation>
        </Box>
      </Paper>
    </Container>
  )
}
