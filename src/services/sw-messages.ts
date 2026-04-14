// 通知 SW 失效 reports 的 API 缓存（写操作成功后调用）。
export const invalidateReportsApiCache = async (userId?: string) => {
  if (!('serviceWorker' in navigator)) return
  const controller = navigator.serviceWorker.controller
  if (!controller) return

  controller.postMessage({
    type: 'API_CACHE_INVALIDATE',
    scope: 'reports',
    userId: userId ?? null,
  })
}
