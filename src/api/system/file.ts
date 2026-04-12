/**
 * 文件上传 API
 */

import request from '@/utils/request'

const MODULE = '/system/file'

/**
 * 文件业务类型枚举
 * 对应后端 FileBizTypeEnum
 */
export enum FileBizTypeEnum {
  /**
   * 用户头像
   */
  AVATAR = 'AVATAR',
}

/**
 * 上传文件
 * @param file 文件
 * @param bizType 业务类型
 * @returns 文件ID
 */
export function uploadFile(file: File, bizType: FileBizTypeEnum): Promise<number> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bizType', String(bizType))
  return request.post(MODULE + '/upload', formData)
}

/**
 * 获取文件访问URL
 * @param fileId 文件ID
 * @returns 文件访问URL
 */
export function getFileAccessUrl(fileId: number): Promise<string> {
  return request.get(MODULE + '/getAccessUrl', { params: { fileId } })
}
