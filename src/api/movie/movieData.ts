/**
 * 影视数据 API
 */

import request from '@/utils/request'

const MODULE = '/movie/data'

/**
 * 判断是否允许访问数据
 * @param userid 用户 ID
 */
export function allowAccess(userid: number): Promise<any> {
  return request.get(MODULE + '/allowAccess', {
    params: { userid },
  })
}
