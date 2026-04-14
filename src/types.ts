export type ReportStatus = 'pending' | 'processing' | 'resolved'

export interface Category {
  id: number
  name: string
}

export interface Report {
  id: string
  title: string
  description: string
  categoryId: number
  categoryName: string
  latitude: number
  longitude: number
  address: string
  status: ReportStatus
  createdAt: string
  synced: boolean
  photos: string[]
}

export interface OfflineQueueItem {
  reportId: string
  queuedAt: string
  payload: {
    userId: string
    categoryId: number
    title: string
    description: string
    latitude: number
    longitude: number
    address: string
    photoUrls: string[]
  }
}
