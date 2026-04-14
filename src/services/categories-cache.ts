import type { Category } from '../types'
import { categories as staticFallback } from '../constants/categories'

const KEY = 'uis_categories_cache'

// 联网拉取成功后写入，离线或接口失败时读回。
export const writeCategoriesCache = (items: Category[]) => {
  if (items.length === 0) return
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // 存储满等情况忽略
  }
}

const readCategoriesCache = (): Category[] => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is Category =>
        x != null && typeof x === 'object' && typeof (x as Category).id === 'number' && typeof (x as Category).name === 'string',
    )
  } catch {
    return []
  }
}

// 离线/失败时使用：优先上次缓存，否则静态分类。
export const getCategoriesOfflineFallback = (): Category[] => {
  const cached = readCategoriesCache()
  return cached.length > 0 ? cached : staticFallback
}
