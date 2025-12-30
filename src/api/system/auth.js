import api from '@/utils/request.js'

//短信登录
export function loginBySms(formData) {
  let url = '/system/auth/loginSms'
  return api.post(url, formData);
}


//判断是否登录
export function isLogin() {
  let url = '/system/auth/isLogin'
  return api.get(url);
}
