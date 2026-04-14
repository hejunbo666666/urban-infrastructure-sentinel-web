import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import { compressImageFile } from '../services/image-compress'
import type { Category } from '../types'

interface ReportFormProps {
  categories: Category[]
  title: string
  description: string
  categoryId: number
  latitude: number | ''
  longitude: number | ''
  address: string
  photoFile: File | null
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onCategoryChange: (value: number) => void
  onLocate: () => void
  onFileChange: (file: File | null) => void
  onSubmit: () => void
  onInstall: () => void
  onNotificationPermission: () => void
}

export function ReportForm(props: ReportFormProps) {
  const {
    categories,
    title,
    description,
    categoryId,
    latitude,
    longitude,
    address,
    photoFile,
    onTitleChange,
    onDescriptionChange,
    onCategoryChange,
    onLocate,
    onFileChange,
    onSubmit,
    onInstall,
    onNotificationPermission,
  } = props
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('')
  const [compressing, setCompressing] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelected = async (file: File | null, input: HTMLInputElement | null) => {
    if (input) input.value = ''
    if (!file) {
      onFileChange(null)
      return
    }
    setCompressing(true)
    try {
      const compressed = await compressImageFile(file, {
        maxSide: 1024,
        maxBytes: 400 * 1024,
        initialQuality: 0.55,
      })
      onFileChange(compressed)
    } catch {
      onFileChange(file)
    } finally {
      setCompressing(false)
    }
  }

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl('')
      return
    }
    const objectUrl = URL.createObjectURL(photoFile)
    setPhotoPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photoFile])

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Submit a report</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Title"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                label="Category"
                value={categoryId}
                onChange={(event) => onCategoryChange(Number(event.target.value))}
              >
                {categories.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label="Description"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap flexWrap="wrap">
            <Button variant="outlined" startIcon={<AddLocationAltIcon />} onClick={onLocate}>
              Use GPS location
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CameraAltIcon />}
              disabled={compressing}
            >
              Take photo
              <input
                ref={cameraInputRef}
                hidden
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) =>
                  handleImageSelected(event.target.files?.[0] ?? null, event.target)
                }
              />
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoLibraryOutlinedIcon />}
              disabled={compressing}
            >
              Choose from gallery
              <input
                ref={galleryInputRef}
                hidden
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleImageSelected(event.target.files?.[0] ?? null, event.target)
                }
              />
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={onSubmit}
              disabled={compressing}
            >
              Submit report
            </Button>
          </Stack>
          {compressing ? (
            <Typography variant="body2" color="text.secondary">
              Compressing image…
            </Typography>
          ) : null}
          {photoPreviewUrl ? (
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Selected image: {photoFile?.name}
              </Typography>
              <Box
                component="img"
                src={photoPreviewUrl}
                alt="Selected image preview"
                sx={{
                  width: '100%',
                  maxHeight: 220,
                  objectFit: 'cover',
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            </Stack>
          ) : null}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Latitude" value={latitude} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Longitude" value={longitude} fullWidth InputProps={{ readOnly: true }} />
          </Stack>
          <TextField label="Address" value={address} fullWidth InputProps={{ readOnly: true }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="text" startIcon={<DownloadForOfflineIcon />} onClick={onInstall}>
              Install to home screen
            </Button>
            <Button
              variant="text"
              startIcon={<NotificationsActiveIcon />}
              onClick={onNotificationPermission}
            >
              Enable notifications
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
