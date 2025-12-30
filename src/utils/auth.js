const AccessTokenKey = 'hoxise_token'
const RefreshTokenKey = 'hoxise_refresh_token'

import store from '@/store/index'
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

export function setRefreshToken (token) {
  localStorage.setItem(RefreshTokenKey, token)
}

//保存用户信息
export function setUserInfo (userInfo) { 
  store.commit('SET_ID', userInfo.userId);
  store.commit('SET_NAME', userInfo.userName);
  store.commit('SET_ROLES',userInfo.roles);
}