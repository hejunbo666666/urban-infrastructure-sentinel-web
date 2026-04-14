import { useMemo, useState } from 'react'
import {
  Alert,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { ReportMap } from '../components/ReportMap'
import { useReportsContext } from '../store/reports-context'
import type { ReportStatus } from '../types'

const statusOptions: Array<{ value: 'all' | ReportStatus; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'resolved', label: 'Resolved' },
]

export function MapPage() {
  const { reports, defaultCenter, categories } = useReportsContext()
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const statusMatched = statusFilter === 'all' ? true : item.status === statusFilter
      const categoryMatched = categoryFilter === 'all' ? true : item.categoryId === categoryFilter
      return statusMatched && categoryMatched
    })
  }, [reports, statusFilter, categoryFilter])

  const stats = useMemo(() => {
    const pending = filteredReports.filter((item) => item.status === 'pending').length
    const processing = filteredReports.filter((item) => item.status === 'processing').length
    const resolved = filteredReports.filter((item) => item.status === 'resolved').length
    return { total: filteredReports.length, pending, processing, resolved }
  }, [filteredReports])

  const selectedReport = useMemo(
    () => filteredReports.find((item) => item.id === selectedReportId) ?? null,
    [filteredReports, selectedReportId],
  )

  const mapCenter = useMemo<[number, number]>(() => {
    const first = filteredReports[0]
    return first ? [first.latitude, first.longitude] : defaultCenter
  }, [filteredReports, defaultCenter])

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Map filters & statistics</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <FormControl fullWidth>
                <InputLabel id="map-status-filter">Status</InputLabel>
                <Select
                  labelId="map-status-filter"
                  label="Status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | ReportStatus)}
                >
                  {statusOptions.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="map-category-filter">Category</InputLabel>
                <Select
                  labelId="map-category-filter"
                  label="Category"
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))
                  }
                >
                  <MenuItem value="all">All categories</MenuItem>
                  {categories.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip color="primary" label={`Total ${stats.total}`} />
              <Chip label={`Pending ${stats.pending}`} />
              <Chip label={`Processing ${stats.processing}`} />
              <Chip label={`Resolved ${stats.resolved}`} />
            </Stack>
            {filteredReports.length === 0 ? (
              <Alert severity="warning">No markers match the current filters. Try another status or category.</Alert>
            ) : (
              <Alert severity="success">{filteredReports.length} marker(s) match the current filters.</Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      <ReportMap reports={filteredReports} center={mapCenter} onMarkerClick={setSelectedReportId} />

      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h6">Selected marker</Typography>
            {selectedReport ? (
              <>
                <Typography fontWeight={700}>{selectedReport.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedReport.description}
                </Typography>
                <Typography variant="body2">Category: {selectedReport.categoryName}</Typography>
                <Typography variant="body2">Status: {selectedReport.status}</Typography>
                <Typography variant="body2">Address: {selectedReport.address}</Typography>
              </>
            ) : (
              <Alert severity="info">Tap a marker on the map to view details.</Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
