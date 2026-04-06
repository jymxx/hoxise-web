/**
 * 访问验证 API
 */

import request from '@/utils/request'

/**
 * 验证服务状态
 */
export function validate(): Promise<any> {
  return request.get('/system/access/validate')
}
