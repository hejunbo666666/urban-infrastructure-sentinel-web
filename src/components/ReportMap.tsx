import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import MapIcon from '@mui/icons-material/Map'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import type { Report } from '../types'

const reportMarkerIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface ReportMapProps {
  reports: Report[]
  center: [number, number]
  onMarkerClick?: (reportId: string) => void
}

export function ReportMap({ reports, center, onMarkerClick }: ReportMapProps) {
  const mapKey = `${center[0]}-${center[1]}-${reports.length}`

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <MapIcon color="primary" />
            <Typography variant="h6">Reports on the map</Typography>
          </Stack>
          <Box sx={{ height: 320, borderRadius: 2, overflow: 'hidden' }}>
            <MapContainer key={mapKey} center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {reports.map((item) => (
                <Marker
                  key={item.id}
                  position={[item.latitude, item.longitude]}
                  icon={reportMarkerIcon}
                  eventHandlers={
                    onMarkerClick
                      ? {
                          click: () => onMarkerClick(item.id),
                        }
                      : undefined
                  }
                >
                  <Popup>
                    <Typography fontWeight={700}>{item.title}</Typography>
                    <Typography variant="body2">{item.categoryName}</Typography>
                    <Typography variant="body2">{item.status}</Typography>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
