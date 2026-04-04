/**
 * 影视目录 API
 * 随机推荐、最近更新、影视库查询等
 */

import request from '@/utils/request'

const MODULE = '/movie/catalog'

/**
 * 随机获取影视
 * @param limit 数量
 * @param userid 用户 ID
 */
export function randomQuery(limit: number = 20, userid: string): Promise<any> {
  return request.get(MODULE + '/' + userid + '/randomQuery', {
    params: { limit },
  })
}

/**
 * 获取统计数据
 * @param userid 用户 ID
 */
export function movieStat(userid: string): Promise<any> {
  return request.get(MODULE + '/' + userid + '/movieStat')
}

/**
 * 获取最近更新
 * @param userid 用户 ID
 */
export function lastUpdate(userid: string): Promise<any> {
  return request.get(MODULE + '/' + userid + '/lastUpdate')
}

/**
 * 分页简单查询
 * @param params 查询参数
 * @param userid 用户 ID
 */
export function pageSimple(params: Record<string, any>, userid: string): Promise<any> {
  return request.get(MODULE + '/' + userid + '/pageSimple', { params })
}

/**
 * 获取影视库数据 后端有缓存
 * @param params 查询参数
 * @param userid 用户 ID
 */
export function getLibrary(params: Record<string, any>, userid: string): Promise<any> {
  return request.get(MODULE + '/' + userid + '/library', { params })
}
