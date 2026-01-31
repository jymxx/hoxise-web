import api from '@/utils/request.js'

const module = '/system/user'
//获取用户信息
export function getUserInfo() {
  let url = module+'/info'
  return api.get(url);
}