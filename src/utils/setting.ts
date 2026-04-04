/**
 * 用户设置管理工具
 * 使用 localStorage 以 JSON 格式存储用户偏好设置
 * 仅供 store 使用
 */

import type { UserSettings } from '@/store/modules/ui'

// 存储键名
const STORAGE_KEY = 'hoxise_user_setting'

/**
 * 获取所有设置（从 localStorage 读取原始值）
 */
export function getSettings(): Partial<UserSettings> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}
    return JSON.parse(stored)
  } catch {
    return {}
  }
}

/**
 * 设置单个配置项
 * @param key - 配置项键名
 * @param value - 配置值
 */
export function setSetting(key: keyof UserSettings, value: boolean | string): void {
  const settings = getSettings()
  settings[key] = value
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}
