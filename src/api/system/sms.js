import api from '@/utils/request.js'

//发送短信验证码
export function sendVerifyCode(phone) {
  let url = '/system/sms/send'
  let formData = new FormData();
  formData.append('phone', phone);
  return api.post(url,formData);
}