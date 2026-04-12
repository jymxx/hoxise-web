/**
 * 影视收藏 API
 * 收藏、取消收藏、检查收藏状态、获取收藏列表
 */

import request from '@/utils/request'

const MODULE = '/movie/favorite'

/**
 * 收藏
 * @param catalogId 目录 ID
 */
export function addFavorite(catalogId: number): Promise<any> {
  const formData = new FormData()
  formData.append('catalogId', catalogId.toString())
  return request.post(MODULE + '/add', formData)
}

/**
 * 取消收藏
 * @param catalogId 目录 ID
 */
export function cancelFavorite(catalogId: number): Promise<any> {
  return request.delete(MODULE + '/cancel', {
    params: { catalogId },
  })
}

/**
 * 检查是否已收藏
 * @param catalogId 目录 ID
 */
export function checkFavorite(catalogId: number): Promise<any> {
  return request.get(MODULE + '/check', {
    params: { catalogId },
  })
}

/**
 * 获取用户收藏的目录 ID 列表
 */
export function getFavoriteCatalogIds(): Promise<any> {
  return request.get(MODULE + '/catalogIds')
}
