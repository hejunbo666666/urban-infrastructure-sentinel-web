import { apiCreateReport } from './api'
import { listOfflineQueue, markSynced } from './db'
import { invalidateReportsApiCache } from './sw-messages'

export const syncOfflineReports = async () => {
  const queue = await listOfflineQueue()
  if (queue.length === 0) return 0

  let syncedCount = 0
  const touchedUserIds = new Set<string>()
  for (const item of queue) {
    try {
      await apiCreateReport(item.payload)
      await markSynced(item.reportId)
      syncedCount += 1
      if (item.payload?.userId) touchedUserIds.add(item.payload.userId)
    } catch {
      continue
    }
  }
  if (syncedCount > 0) {
    for (const userId of touchedUserIds) {
      await invalidateReportsApiCache(userId)
    }
  }
  return syncedCount
}
