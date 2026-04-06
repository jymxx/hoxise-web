/**
 * 影视数据库 API
 * 详情、角色、章节、播放地址
 */

import request from '@/utils/request'

const MODULE = '/movie/db'

/**
 * 获取影视详情
 * @param bangumiId bangumi ID
 */
export function getMovieDetail(bangumiId: string): Promise<any> {
  return request.get(MODULE + '/detail', {
    params: { bangumiId },
  })
}

/**
 * 获取影视角色
 * @param bangumiId bangumi ID
 */
export function getMovieCharacter(bangumiId: string): Promise<any> {
  return request.get(MODULE + '/characters', {
    params: { bangumiId },
  })
}

/**
 * 获取剧集信息
 * @param bangumiId bangumi ID
 */
export function getMovieEpisode(bangumiId: string): Promise<any> {
  return request.get(MODULE + '/episodes', {
    params: { bangumiId },
  })
}

/**
 * 获取播放地址
 * @param params 查询参数
 */
export function getPlayerUrl(params: Record<string, any>): Promise<any> {
  return request.get(MODULE + '/playerUrl', { params })
}
