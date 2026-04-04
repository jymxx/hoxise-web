/**
 * 系统短信 API
 */

import request from '@/utils/request'

const MODULE = '/system/sms'

/**
 * 发送短信验证码
 * @param phone 手机号
 */
export function sendVerifyCode(phone: string): Promise<void> {
  return request.post(MODULE + '/send', { phone })
}
