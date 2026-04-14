import { Alert, Button, Card, CardContent, IconButton, Stack, Typography } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import { useNavigate } from 'react-router-dom'
import { ReportList } from '../components/ReportList'
import { useReportsContext } from '../store/reports-context'

export function MyReportsPage() {
  const navigate = useNavigate()
  const { reports, changeStatus, currentUser } = useReportsContext()

  if (!currentUser) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Alert severity="warning">Please sign in to view your reports.</Alert>
            <Button variant="contained" onClick={() => navigate('/my')}>
              Go to My page to sign in
            </Button>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton size="small" onClick={() => navigate('/my')}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          My reports
        </Typography>
      </Stack>
      <ReportList reports={reports} onChangeStatus={changeStatus} />
    </Stack>
  )
}
