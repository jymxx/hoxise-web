const AccessTokenKey = 'hoxise_token'
const RefreshTokenKey = 'hoxise_refresh_token'

// ========== Token 相关 ==========

export function getToken () {
  return localStorage.getItem(AccessTokenKey)
}

export function getRefreshToken () {
  return localStorage.getItem(RefreshTokenKey)
}

export function setToken (token) {
  localStorage.setItem(AccessTokenKey, token)
}

export function removeToken () {
  localStorage.removeItem(AccessTokenKey)
}
