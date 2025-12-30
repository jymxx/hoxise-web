import api from '@/utils/request.js'

//获取用户信息
export function getUserInfo() {
  let url = '/system/user/info'
  return api.get(url);
}