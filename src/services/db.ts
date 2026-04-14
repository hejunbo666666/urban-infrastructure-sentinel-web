import { openDB } from 'idb'
import type { DBSchema } from 'idb'
import type { OfflineQueueItem, Report, ReportStatus } from '../types'

interface SentinelDb extends DBSchema {
  reports: {
    key: string
    value: Report
  }
  offline_reports: {
    key: string
    value: OfflineQueueItem
  }
}

const dbPromise = openDB<SentinelDb>('urban-infrastructure-sentinel-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('reports')) {
      db.createObjectStore('reports', { keyPath: 'id' })
    }
    if (!db.objectStoreNames.contains('offline_reports')) {
      db.createObjectStore('offline_reports', { keyPath: 'reportId' })
    }
  },
})

export const addReport = async (report: Report) => {
  const db = await dbPromise
  await db.put('reports', report)
}

export const listReports = async () => {
  const db = await dbPromise
  const data = await db.getAll('reports')
  return data.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export const updateReportStatus = async (id: string, status: ReportStatus) => {
  const db = await dbPromise
  const report = await db.get('reports', id)
  if (!report) return
  await db.put('reports', { ...report, status })
}

export const queueOfflineReport = async (reportId: string, payload: OfflineQueueItem['payload']) => {
  const db = await dbPromise
  const item: OfflineQueueItem = { reportId, queuedAt: new Date().toISOString(), payload }
  await db.put('offline_reports', item)
}

export const listOfflineQueue = async () => {
  const db = await dbPromise
  return db.getAll('offline_reports')
}

export const markSynced = async (reportId: string) => {
  const db = await dbPromise
  await db.delete('reports', reportId)
  await db.delete('offline_reports', reportId)
}

export const getReportById = async (id: string) => {
  const db = await dbPromise
  return db.get('reports', id)
}

export const removeReportFromDb = async (id: string) => {
  const db = await dbPromise
  await db.delete('reports', id)
  await db.delete('offline_reports', id)
}

export const clearReports = async () => {
  const db = await dbPromise
  await db.clear('reports')
}

export const clearOfflineQueue = async () => {
  const db = await dbPromise
  await db.clear('offline_reports')
}
