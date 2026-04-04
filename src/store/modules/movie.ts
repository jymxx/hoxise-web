/**
 * 影视状态管理 Store
 * 管理全局影视相关状态（访问用户 ID 等）
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMovieStore = defineStore('movie', () => {
  // ========== state ==========
  /**
   * 访问用户 ID
   * 用于访问他人数据时记录目标用户
   */
  const accessUserid = ref<string>('')

  /**
   * 访问用户昵称
   */
  const accessNickName = ref<string>('')

  // ========== actions ==========
  /**
   * 设置访问者用户 ID 和昵称
   * @param userid 目标用户 ID
   * @param nickName 用户昵称
   */
  const setAccessUserInfo = (userid: string, nickName: string) => {
    accessUserid.value = userid
    accessNickName.value = nickName
  }

  /**
   * 重置访问用户信息
   */
  const resetAccessUserInfo = () => {
    accessUserid.value = ''
    accessNickName.value = ''
  }

  // ========== 导出 ==========
  return {
    // state
    accessUserid,
    accessNickName,
    // actions
    setAccessUserInfo,
    resetAccessUserInfo,
  }
})
