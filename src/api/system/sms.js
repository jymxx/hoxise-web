import api from '@/utils/request.js'

const module = '/system/sms'

//发送短信验证码
export function sendVerifyCode(phone) {
  let url = module+'/send'
  let formData = new FormData();
  formData.append('phone', phone);
  return api.post(url,formData);
}