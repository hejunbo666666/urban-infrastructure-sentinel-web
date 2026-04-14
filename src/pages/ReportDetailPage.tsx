import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  ImageList,
  ImageListItem,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiGetReportById } from '../services/api'
import { getReportById } from '../services/db'
import { useReportsContext } from '../store/reports-context'
import type { Report, ReportStatus } from '../types'

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US')
  } catch {
    return iso
  }
}

export function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const { reports, changeStatus, deleteReport, setSnack } = useReportsContext()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 只用于兜底读取列表，不参与 effect 依赖，避免删除后 loadReports 更新列表又触发一次详情请求（此时 id 已不存在会报错）。
  const reportsRef = useRef(reports)
  reportsRef.current = reports

  const load = useCallback(async () => {
    if (!reportId) return
    setLoading(true)
    const fromList = reportsRef.current.find((r) => r.id === reportId)
    const fromDb = fromList ? null : await getReportById(reportId)
    const fallback = fromList ?? fromDb ?? null

    const tryRemote = navigator.onLine && !reportId.startsWith('offline-')

    if (tryRemote) {
      try {
        const data = await apiGetReportById(reportId)
        setReport(data)
        return
      } catch {
        setReport(fallback)
        if (!fallback) setSnack('Could not load details. Check your connection or whether the report was removed.')
        return
      } finally {
        setLoading(false)
      }
    }

    setReport(fallback)
    setLoading(false)
    if (!fallback) setSnack('Report not found.')
  }, [reportId, setSnack])

  useEffect(() => {
    load().catch(() => {
      setLoading(false)
      setSnack('Could not load details.')
    })
  }, [load])

  const handleDelete = async () => {
    if (!reportId) return
    setDeleting(true)
    try {
      const ok = await deleteReport(reportId)
      if (ok) {
        setDeleteOpen(false)
        navigate('/my/reports', { replace: true })
      }
    } finally {
      setDeleting(false)
    }
  }

  const onChangeStatus = async (status: ReportStatus) => {
    if (!report?.id || report.id.startsWith('offline-')) {
      setSnack('This report is not synced yet. Wait for sync before changing status.')
      return
    }
    try {
      await changeStatus(report.id, status)
      if (navigator.onLine) {
        const data = await apiGetReportById(report.id)
        setReport(data)
      }
    } catch {
      setSnack('Failed to update status.')
    }
  }

  if (!reportId) {
    return (
      <Alert severity="warning">
        Invalid report
        <Button sx={{ ml: 1 }} onClick={() => navigate('/my/reports')}>
          Back to list
        </Button>
      </Alert>
    )
  }

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (!report) {
    return (
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton size="small" onClick={() => navigate('/my/reports')}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" fontWeight={700}>
            Report details
          </Typography>
        </Stack>
        <Alert severity="info">No report found.</Alert>
        <Button variant="contained" onClick={() => navigate('/my/reports')}>
          Back to list
        </Button>
      </Stack>
    )
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton size="small" onClick={() => navigate('/my/reports')}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1, minWidth: 0 }}>
          Report details
        </Typography>
        <IconButton
          size="small"
          color="error"
          aria-label="Delete"
          onClick={() => setDeleteOpen(true)}
        >
          <DeleteOutlineIcon />
        </IconButton>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="h6" fontWeight={700}>
              {report.title}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip size="small" label={report.categoryName} />
              <Chip
                size="small"
                color={
                  report.status === 'resolved'
                    ? 'success'
                    : report.status === 'processing'
                      ? 'warning'
                      : 'default'
                }
                label={report.status}
              />
              <Chip size="small" variant="outlined" label={report.synced ? 'Synced' : 'Pending sync'} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Submitted: {formatTime(report.createdAt)}
            </Typography>
            <Divider />
            <Typography variant="subtitle2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {report.description}
            </Typography>
            <Divider />
            <Typography variant="subtitle2" color="text.secondary">
              Location
            </Typography>
            <Typography variant="body2">{report.address || 'No address provided'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {report.photos.length > 0 ? (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              Photos ({report.photos.length})
            </Typography>
            <ImageList variant="masonry" cols={2} gap={8}>
              {report.photos.map((url) => (
                <ImageListItem key={url}>
                  <Box
                    component="img"
                    src={url}
                    alt=""
                    loading="lazy"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 1,
                      display: 'block',
                      bgcolor: 'action.hover',
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography color="text.secondary">No photos</Typography>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Status
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button size="small" variant="outlined" onClick={() => onChangeStatus('pending')}>
              Pending
            </Button>
            <Button size="small" variant="outlined" onClick={() => onChangeStatus('processing')}>
              Processing
            </Button>
            <Button size="small" variant="contained" onClick={() => onChangeStatus('resolved')}>
              Resolved
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)}>
        <DialogTitle>Delete this report?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This cannot be undone. Synced reports will also be removed from the server.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
