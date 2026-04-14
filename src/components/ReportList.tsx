import {
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import type { Report, ReportStatus } from '../types'

interface ReportListProps {
  reports: Report[]
  onChangeStatus: (id: string, status: ReportStatus) => void
}

export function ReportList({ reports, onChangeStatus }: ReportListProps) {
  const navigate = useNavigate()
  if (reports.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            My reports
          </Typography>
          <Typography color="text.secondary">No reports yet. Submit one from the Report tab.</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="h6" sx={{ px: 0.5 }}>
        My reports
      </Typography>
      {reports.map((item) => (
        <Card key={item.id}>
          <CardContent>
            <Stack spacing={1.25}>
              <Typography fontWeight={700}>{item.title}</Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip size="small" label={item.categoryName} />
                <Chip
                  size="small"
                  color={
                    item.status === 'resolved'
                      ? 'success'
                      : item.status === 'processing'
                        ? 'warning'
                        : 'default'
                  }
                  label={item.status}
                />
                <Chip size="small" variant="outlined" label={item.synced ? 'Synced' : 'Pending sync'} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {item.address}
              </Typography>
              <Button size="small" variant="text" onClick={() => navigate(`/my/reports/${item.id}`)}>
                View details
              </Button>
              <Divider />
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button size="small" variant="outlined" onClick={() => onChangeStatus(item.id, 'pending')}>
                  Pending
                </Button>
                <Button size="small" variant="outlined" onClick={() => onChangeStatus(item.id, 'processing')}>
                  Processing
                </Button>
                <Button size="small" variant="contained" onClick={() => onChangeStatus(item.id, 'resolved')}>
                  Resolved
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}
