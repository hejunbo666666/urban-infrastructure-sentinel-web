import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { usePwa } from '../hooks/usePwa'
import {
  apiCreateReport,
  apiDeleteReport,
  apiGetCategories,
  apiGetReports,
  apiLogin,
  apiLogout,
  apiUploadReportPhoto,
  apiUpdateReportStatus,
  type CurrentUser,
} from '../services/api'
import { getCategoriesOfflineFallback, writeCategoriesCache } from '../services/categories-cache'
import { addReport, listReports, queueOfflineReport, removeReportFromDb } from '../services/db'
import { reverseGeocode } from '../services/location'
import { invalidateReportsApiCache } from '../services/sw-messages'
import type { Category, Report, ReportStatus } from '../types'

interface ReportsContextValue {
  reports: Report[]
  categories: Category[]
  defaultCenter: [number, number]
  title: string
  description: string
  categoryId: number
  latitude: number | ''
  longitude: number | ''
  address: string
  photoFile: File | null
  snack: string
  setSnack: (value: string) => void
  setTitle: (value: string) => void
  setDescription: (value: string) => void
  setCategoryId: (value: number) => void
  setPhotoFile: (file: File | null) => void
  locate: () => void
  submitReport: () => Promise<void>
  changeStatus: (id: string, status: ReportStatus) => Promise<void>
  deleteReport: (id: string) => Promise<boolean>
  askNotificationPermission: () => Promise<void>
  installApp: () => Promise<void>
  currentUser: CurrentUser | null
  login: (account: string, password: string) => Promise<boolean>
  logout: () => void
  refreshReports: () => Promise<void>
}

const ReportsContext = createContext<ReportsContextValue | null>(null)
const USER_STORAGE_KEY = 'uis_current_user'

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<number>(1)
  const [latitude, setLatitude] = useState<number | ''>('')
  const [longitude, setLongitude] = useState<number | ''>('')
  const [address, setAddress] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [snack, setSnack] = useState('')
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as CurrentUser
    } catch {
      return null
    }
  })

  const defaultCenter = useMemo<[number, number]>(() => {
    const first = reports[0]
    return first ? [first.latitude, first.longitude] : [39.9042, 116.4074]
  }, [reports])

  const loadReports = useCallback(async (userId?: string) => {
    const localData = await listReports()
    let remoteData: Report[] = []
    try {
      remoteData = await apiGetReports(userId)
    } catch {
      remoteData = []
    }
    const merged = [...remoteData, ...localData.filter((item) => !remoteData.some((r) => r.id === item.id))]
    merged.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    setReports(merged)
  }, [])

  const applyCategorySelection = (data: Category[]) => {
    if (data.length === 0) return
    setCategoryId((prev) => (data.some((item) => item.id === prev) ? prev : data[0].id))
  }

  const loadCategories = async () => {
    try {
      const data = await apiGetCategories()
      if (data.length > 0) {
        writeCategoriesCache(data)
        setCategories(data)
        applyCategorySelection(data)
        return
      }
      const fallback = getCategoriesOfflineFallback()
      setCategories(fallback)
      applyCategorySelection(fallback)
    } catch {
      const fallback = getCategoriesOfflineFallback()
      setCategories(fallback)
      applyCategorySelection(fallback)
    }
  }

  useEffect(() => {
    loadCategories().catch(() => setSnack('Failed to load categories. Check the server API.'))
    if (currentUser) {
      loadReports(currentUser.userId).catch(() => setSnack('Failed to load reports. Check the server API.'))
    }
  }, [])
  useEffect(() => {
    if (!currentUser) return
    loadReports(currentUser.userId).catch(() => setSnack('Failed to load reports. Check the server API.'))
  }, [currentUser])


  const { install } = usePwa(async (synced) => {
    setSnack(`Back online. ${synced} offline report(s) synced.`)
    await loadReports(currentUser?.userId)
  })

  const askNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setSnack('This browser does not support notifications.')
      return
    }
    const result = await Notification.requestPermission()
    setSnack(`Notification permission: ${result}`)
  }

  const locate = () => {
    if (!navigator.geolocation) {
      setSnack('This browser does not support geolocation.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(6))
        const lng = Number(position.coords.longitude.toFixed(6))
        setLatitude(lat)
        setLongitude(lng)
        const locationAddress = await reverseGeocode(lat, lng)
        setAddress(locationAddress)
      },
      () => setSnack('Location failed. Check device location permission.'),
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  const installApp = async () => {
    const ok = await install()
    if (!ok) {
      const ua = navigator.userAgent.toLowerCase()
      const isIos = /iphone|ipad|ipod/.test(ua)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches

      if (isStandalone) {
        setSnack('Already installed as an app.')
        return
      }

      if (!window.isSecureContext) {
        setSnack('PWA install requires HTTPS or localhost (not plain HTTP to an IP).')
        return
      }

      if (import.meta.env.DEV) {
        setSnack('Install is disabled in development. Run build + preview to test install.')
        return
      }

      if (isIos) {
        setSnack('On iOS use Safari: Share → Add to Home Screen.')
        return
      }

      setSnack('Install prompt not available. Try Chrome/Edge and confirm PWA requirements.')
    }
  }

  const submitReport = async () => {
    if (!currentUser) {
      setSnack('Please sign in before submitting a report.')
      return
    }
    if (!title.trim() || !description.trim()) {
      setSnack('Please enter a title and description.')
      return
    }
    if (latitude === '' || longitude === '') {
      setSnack('Please get your location first.')
      return
    }
    if (!navigator.onLine && photoFile) {
      setSnack('Photo upload is not available offline. Go online to submit, or remove the image for an offline report.')
      return
    }

    let photoUrls: string[] = []
    if (photoFile) {
      try {
        const uploadedUrl = await apiUploadReportPhoto(photoFile)
        photoUrls = [uploadedUrl]
      } catch {
        setSnack('Photo upload failed. Check your connection and try again.')
        return
      }
    }

    const payload = {
      userId: currentUser.userId,
      categoryId,
      title: title.trim(),
      description: description.trim(),
      latitude,
      longitude,
      address: address || `${latitude}, ${longitude}`,
      photoUrls,
    }

    const resetForm = () => {
      setTitle('')
      setDescription('')
      setPhotoFile(null)
    }

    if (!navigator.onLine) {
      const reportId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? `offline-${crypto.randomUUID()}`
          : `offline-${Date.now()}`
      const categoryName = categories.find((item) => item.id === categoryId)?.name ?? 'Uncategorized'
      const offlineReport: Report = {
        id: reportId,
        title: payload.title,
        description: payload.description,
        categoryId: payload.categoryId,
        categoryName,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
        status: 'pending',
        createdAt: new Date().toISOString(),
        synced: false,
        photos: payload.photoUrls,
      }
      await addReport(offlineReport)
      await queueOfflineReport(reportId, payload)
      setReports((prev) => [offlineReport, ...prev])
      setSnack('You are offline. Saved locally; it will sync when you are back online.')
      resetForm()
      return
    }

    try {
      await apiCreateReport(payload)
      await invalidateReportsApiCache(currentUser.userId)
      setSnack('Report submitted successfully.')
      resetForm()
      await loadReports(currentUser.userId)
    } catch {
      const reportId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? `offline-${crypto.randomUUID()}`
          : `offline-${Date.now()}`
      const categoryName = categories.find((item) => item.id === categoryId)?.name ?? 'Uncategorized'
      const offlineReport: Report = {
        id: reportId,
        title: payload.title,
        description: payload.description,
        categoryId: payload.categoryId,
        categoryName,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
        status: 'pending',
        createdAt: new Date().toISOString(),
        synced: false,
        photos: payload.photoUrls,
      }
      await addReport(offlineReport)
      await queueOfflineReport(reportId, payload)
      setReports((prev) => [offlineReport, ...prev])
      setSnack('Network error. Saved offline; it will sync when the connection is restored.')
      resetForm()
    }
  }

  const changeStatus = async (id: string, status: ReportStatus) => {
    await apiUpdateReportStatus(id, status)
    await invalidateReportsApiCache(currentUser?.userId ?? undefined)
    setSnack('Status updated.')
    await loadReports(currentUser?.userId)
  }

  const deleteReport = async (id: string): Promise<boolean> => {
    const isLocalOnly = id.startsWith('offline-')
    if (isLocalOnly) {
      await removeReportFromDb(id)
      setReports((prev) => prev.filter((r) => r.id !== id))
      await invalidateReportsApiCache(currentUser?.userId ?? undefined)
      setSnack('Local report removed.')
      return true
    }
    try {
      await apiDeleteReport(id)
      await removeReportFromDb(id)
      await invalidateReportsApiCache(currentUser?.userId ?? undefined)
      setSnack('Report deleted.')
      await loadReports(currentUser?.userId)
      return true
    } catch {
      setSnack('Delete failed. Check your connection and try again.')
      return false
    }
  }

  const login = async (account: string, password: string) => {
    try {
      const user = await apiLogin(account, password)
      setCurrentUser(user)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      await loadReports(user.userId)
      setSnack('Signed in successfully.')
      return true
    } catch {
      setSnack('Sign-in failed. Check your account or password.')
      return false
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem(USER_STORAGE_KEY)
    setReports([])
    apiLogout().catch(() => undefined)
    setSnack('Signed out.')
  }

  const refreshReports = useCallback(async () => {
    if (!currentUser) return
    await loadReports(currentUser.userId)
  }, [currentUser, loadReports])

  return (
    <ReportsContext.Provider
      value={{
        reports,
        categories,
        defaultCenter,
        title,
        description,
        categoryId,
        latitude,
        longitude,
        address,
        photoFile,
        snack,
        setSnack,
        setTitle,
        setDescription,
        setCategoryId,
        setPhotoFile,
        locate,
        submitReport,
        changeStatus,
        deleteReport,
        askNotificationPermission,
        installApp,
        currentUser,
        login,
        logout,
        refreshReports,
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

export function useReportsContext() {
  const context = useContext(ReportsContext)
  if (!context) {
    throw new Error('useReportsContext must be used within ReportsProvider')
  }
  return context
}
