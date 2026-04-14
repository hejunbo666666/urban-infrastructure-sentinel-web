import { Avatar, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PersonIcon from '@mui/icons-material/Person'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import LogoutIcon from '@mui/icons-material/Logout'
import { useNavigate } from 'react-router-dom'
import { useReportsContext } from '../store/reports-context'

export function MyPage() {
  const navigate = useNavigate()
  const { reports, currentUser, logout } = useReportsContext()

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 52, height: 52 }}>
                <PersonIcon />
              </Avatar>
              <Stack spacing={0.5}>
                <Typography fontWeight={700}>{currentUser?.name ?? 'Inspector'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Account: {currentUser?.account ?? '-'}
                </Typography>
              </Stack>
            </Stack>
            <Button color="error" startIcon={<LogoutIcon />} onClick={logout}>
              Sign out
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AssignmentIcon />}
            endIcon={<ChevronRightIcon />}
            onClick={() => navigate('/my/reports')}
            sx={{ justifyContent: 'space-between', py: 1.25 }}
          >
            <span>My reports</span>
            <span>{reports.length} items</span>
          </Button>
        </CardContent>
      </Card>
    </Stack>
  )
}
