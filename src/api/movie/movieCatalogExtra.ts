/**
 * 影视目录-拓展信息 API
 */

import request from '@/utils/request'

const MODULE = '/movie/catalogExtra'

/**
 * 保存扩展信息
 * @param data 保存请求
 */
export function saveCatalogExtra(data: {
  catalogId: number
  resourceType: string
  fileId?: string
  cloudDriveUrl?: string
  showName: string
  secret?: string
}): Promise<any> {
  return request.post(MODULE + '/save', data)
}

/**
 * 更新扩展信息
 * @param data 更新请求
 */
export function updateCatalogExtra(data: { id: number; showName?: string; cloudDriveUrl?: string }): Promise<any> {
  return request.put(MODULE + '/update', data)
}

/**
 * 删除扩展信息
 * @param id 主键 ID
 */
export function deleteCatalogExtra(id: number): Promise<any> {
  return request.delete(MODULE + '/delete/' + id)
}

/**
 * 检查是否存在可获取的信息
 * @param catalogId 目录 ID
 */
export function hasCatalogExtraInfo(catalogId: number): Promise<any> {
  return request.get(MODULE + '/hasInfo', { params: { catalogId } })
}

/**
 * 查询实际资源地址
 * @param extraId 扩展信息 ID
 * @param secret 密钥（可选）
 */
export function getCatalogExtraResourceUrl(extraId: number, secret?: string): Promise<any> {
  return request.get(MODULE + '/resourceUrl', { params: { extraId, secret } })
}
