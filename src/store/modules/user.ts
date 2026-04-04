/**
 * 用户状态管理 Store
 * 管理全局用户信息（ID、用户名、角色）
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  userId: string
  userName: string
  nickName: string
  roles: string[]
  permissions?: string[]
  avatar: string
}

export const useUserStore = defineStore('user', () => {
  // ========== state ==========
  const id = ref<string>('')
  const name = ref<string>('')
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])
  const nickName = ref<string>('')
  const avatar = ref<string>('')

  // ========== getters (计算属性) ==========
  /**
   * 是否已登录
   */
  const isLogin = computed(() => id.value !== '' && id.value !== null && id.value !== undefined)

  /**
   * 是否为管理员
   */
  const isAdmin = computed(() => roles.value.includes('admin'))

  /**
   * 检查是否拥有指定角色
   * @param role 角色名
   */
  const hasRole = (role: string) => computed(() => roles.value.includes(role))

  // ========== actions ==========
  /**
   * 设置用户信息（推荐：一次性设置全部）
   * @param info 用户信息对象
   */
  const setUserInfo = (info: UserInfo) => {
    id.value = info.userId
    name.value = info.userName
    nickName.value = info.nickName
    roles.value = info.roles
    permissions.value = info.permissions ?? []
    avatar.value = info.avatar
  }

  /**
   * 重置用户信息（登出时调用）
   */
  const reset = () => {
    id.value = ''
    name.value = ''
    roles.value = []
    permissions.value = []
  }

  // ========== 导出 ==========
  return {
    // state
    id,
    name,
    nickName,
    roles,
    permissions,
    avatar,
    // getters
    isLogin,
    isAdmin,
    hasRole,
    // actions
    setUserInfo,
    reset,
  }
})
