import api from '@/utils/request.js'

const module = '/system/auth'

//短信登录
export function loginBySms(formData) {
  let url = module+'/loginSms'
  return api.post(url, formData);
}


//判断是否登录
export function isLogin() {
  let url = module+'/isLogin'
  return api.get(url);
}
