import type { Category, Report, ReportStatus } from '../types'

const API_BASE_URL = 'https://test.wybody.top/api'
const API_UPLOAD_PATH = '/files/upload'

interface LoginApiResponse {
  userId: string
  username: string
  account: string
  token: string
}

interface ReportApiResponse {
  id: string
  userId: string
  categoryId: number
  categoryName: string
  title: string
  description: string
  latitude: number
  longitude: number
  address: string
  status: ReportStatus
  createdAt: string
  photos: string[]
}

export interface CurrentUser {
  userId: string
  name: string
  account: string
  token: string
}

const request = async <T>(path: string, init?: RequestInit) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null as T
  }
  return (await response.json()) as T
}

export const apiLogin = async (account: string, password: string): Promise<CurrentUser> => {
  const data = await request<LoginApiResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ account, password }),
  })
  return {
    userId: data.userId,
    name: data.username,
    account: data.account,
    token: data.token,
  }
}

export const apiLogout = async () => {
  await request<{ message: string }>('/auth/logout', { method: 'POST' })
}

export const apiGetCategories = async (): Promise<Category[]> => {
  return request<Category[]>('/categories')
}

const mapReport = (item: ReportApiResponse): Report => ({
  id: item.id,
  title: item.title,
  description: item.description,
  categoryId: item.categoryId,
  categoryName: item.categoryName,
  latitude: Number(item.latitude),
  longitude: Number(item.longitude),
  address: item.address ?? '',
  status: item.status,
  createdAt: item.createdAt,
  synced: true,
  photos: item.photos ?? [],
})

export const apiGetReports = async (userId?: string): Promise<Report[]> => {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : ''
  const data = await request<ReportApiResponse[]>(`/reports${query}`)
  return data.map(mapReport)
}

export const apiGetReportById = async (id: string): Promise<Report> => {
  const data = await request<ReportApiResponse>(`/reports/${encodeURIComponent(id)}`)
  return mapReport(data)
}

export const apiDeleteReport = async (id: string) => {
  await request<null>(`/reports/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export const apiCreateReport = async (payload: {
  userId: string
  categoryId: number
  title: string
  description: string
  latitude: number
  longitude: number
  address: string
  photoUrls: string[]
}) => {
  const data = await request<ReportApiResponse>('/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return mapReport(data)
}

export const apiUpdateReportStatus = async (id: string, status: ReportStatus) => {
  await request<{ message: string }>(`/reports/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

export const apiUploadReportPhoto = async (file: File) => {
  const formData = new FormData()
  // Must match backend parameter name: Upload(IFormFile file)
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}${API_UPLOAD_PATH}`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Upload failed: ${response.status}`)
  }

  const data = (await response.json()) as { url: string }
  return data.url
}
