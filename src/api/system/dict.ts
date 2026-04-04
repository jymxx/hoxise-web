/**
 * 系统字典 API
 * 用于获取系统配置字典
 */

import request from '@/utils/request'

const MODULE = '/system/dict'

/**
 * 根据 key 获取字典配置
 * @param key 字典键
 */
export function getDict(key: string): Promise<any> {
  return request.get(MODULE + '/getByKey', {
    params: { key },
  })
}
