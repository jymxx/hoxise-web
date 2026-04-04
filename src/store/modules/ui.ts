/**
 * 全局 UI 状态管理
 * 管理全局 UI 弹窗状态（登录框、匹配框等）和用户设置
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSettings, setSetting } from '@/utils/setting'

/**
 * 用户设置接口
 */
export interface UserSettings {
  enableBgEffect: boolean | string // 背景特效开关
  enableClickEffect : boolean | string // 点击特效开关
  enableSleekLineCursor: boolean | string // 流线鼠标轨迹开关
}

export const useUIStore = defineStore('ui', () => {
  // ========== 登录对话框 ==========
  const showLogin = ref(false)

  const openLoginDialog = () => {
    showLogin.value = true
  }

  const closeLoginDialog = () => {
    showLogin.value = false
  }

  // ========== 用户设置 有默认值 ==========
  const settings = ref<UserSettings>({
    enableClickEffect: true,
    enableBgEffect: true,
    enableSleekLineCursor: false,
  })

  /**
   * 加载用户设置
   */
  const loadSettings = () => {
    const saved = getSettings()
    if (saved.enableBgEffect != null) settings.value.enableBgEffect = saved.enableBgEffect
    if (saved.enableClickEffect != null) settings.value.enableClickEffect = saved.enableClickEffect
    if (saved.enableSleekLineCursor != null) settings.value.enableSleekLineCursor = saved.enableSleekLineCursor
  }

  /**
   * 设置单个配置项
   */
  const updateSetting = (key: keyof UserSettings, value: boolean | string) => {
    settings.value[key] = value
    setSetting(key, value)
  }

  return {
    // state
    showLogin,
    settings,
    // actions
    openLoginDialog,
    closeLoginDialog,
    loadSettings,
    updateSetting,
    getSetting: (key: keyof UserSettings) => settings.value[key],
  }
})
