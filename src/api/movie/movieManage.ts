/**
 * 影视管理 API
 * Bangumi 查询、更新、删除、扫描上传、自动匹配
 */

import request from '@/utils/request'

const MODULE = '/movie/manage'

/**
 * 从 Bangumi 查询数据
 * @param name 名称
 */
export function queryBangumi(name: string): Promise<any> {
  return request.get(MODULE + '/bangumi', {
    params: { name },
  })
}

/**
 * 更新数据库 Bangumi 信息
 * @param catalogId 影视 ID
 * @param bangumiId Bangumi ID
 */
export function updateDbBangumi(catalogId: string, bangumiId: string): Promise<any> {
  const formData = new FormData()
  formData.append('catalogid', catalogId)
  formData.append('bangumiId', bangumiId)
  return request.put(MODULE + '/updateDb', formData)
}

/**
 * 删除影视目录
 * @param catalogId 影视 ID
 */
export function deleteCatalog(catalogId: string): Promise<any> {
  return request.delete(MODULE + '/deleteCatalog/' + catalogId)
}

/**
 * 扫描目录上传
 * @param data 请求数据
 */
export function scanUpload(data: FormData): Promise<any> {
  return request.post(MODULE + '/scanUpload', data)
}

/**
 * 自动匹配
 */
export function autoMatch(): Promise<any> {
  return request.post(MODULE + '/autoMatch')
}
