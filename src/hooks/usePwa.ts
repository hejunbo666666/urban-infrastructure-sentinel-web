import { useEffect, useState } from 'react'
import { syncOfflineReports } from '../services/sync'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

interface SyncServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync?: {
    register: (tag: string) => Promise<void>
  }
}

export const usePwa = (onSynced: (count: number) => void) => {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setInstallPromptEvent(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    const handleOnline = async () => {
      const synced = await syncOfflineReports()
      if (synced > 0) onSynced(synced)
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [onSynced])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.ready
      .then((registration) =>
        (registration as SyncServiceWorkerRegistration).sync?.register('sync-offline-reports'),
      )
      .catch(() => undefined)
  }, [])

  const install = async () => {
    if (!installPromptEvent) return false
    await installPromptEvent.prompt()
    return true
  }

  return { install }
}
