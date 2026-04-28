/**
 * 系统用户 API
 */

import request from '@/utils/request'

const MODULE = '/system/user'

/**
 * 用户信息 VO
 */
export interface UserInfoVO {
  userId: number
  userName: string
  nickName: string
  phoneNumber: string
  roles: string[]
  avatar: string
}

/**
 * 获取当前登录用户信息
 */
export function getUserInfo(): Promise<UserInfoVO> {
  return request.get(MODULE + '/info')
}

/**
 * 修改用户信息
 */
export function modifyUserInfo(data: any): Promise<void> {
  return request.put(MODULE + '/modifyUserInfo', data)
}

/**
 * 上传用户头像
 * @param file 头像文件
 * @returns 头像访问 URL
 */
export function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  return request.put(MODULE + '/uploadAvatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
