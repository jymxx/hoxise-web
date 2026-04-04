/**
 * Token 管理工具
 * 负责 localStorage 中 token 的存取
 */

// ========== 存储键名 ==========
const ACCESS_TOKEN_KEY = 'hoxise_token'
const REFRESH_TOKEN_KEY = 'hoxise_refresh_token'

// ========== Token 相关 ==========

/**
 * 获取访问令牌
 * @returns 令牌字符串，不存在返回 null
 */
export function getToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * 获取刷新令牌
 * @returns 刷新令牌字符串，不存在返回 null
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * 设置访问令牌
 * @param token 令牌字符串
 */
export function setToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

/**
 * 移除访问令牌
 */
export function removeToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

/**
 * 设置刷新令牌
 * @param token 刷新令牌字符串
 */
export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

/**
 * 移除刷新令牌
 */
export function removeRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * 清除所有认证信息
 */
export function clearAuthInfo(): void {
  removeToken()
  removeRefreshToken()
}
