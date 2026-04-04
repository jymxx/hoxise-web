/**
 * 系统认证 API
 * 登录、登出、登录状态检查
 */

import request from '@/utils/request'

const MODULE = '/system/auth'

import type { UserInfoVO } from './user'

// ========== DTO/VO 类型定义 ==========

/**
 * 短信登录请求 DTO
 */
export interface SmsLoginRequest {
  phone: string
  verifyCode: string
}

/**
 * 登录结果 VO
 */
export interface LoginResultVO {
  status: string
  loginTime: string
  token: string
  userInfo: UserInfoVO
}

// ========== API 方法 ==========

/**
 * 短信验证码登录/注册
 * @param data 登录表单数据
 */
export function loginBySms(data: SmsLoginRequest): Promise<LoginResultVO> {
  return request.post(MODULE + '/loginSms', data)
}

/**
 * 登出
 */
export function logout(): Promise<any> {
  return request.post(MODULE + '/logout')
}
