import api from '@/utils/request.js'

const module = '/system/dict'

//获取字典配置
export function getDict(key) {
  let url = module+'/getByKey'
  return api.get(url,{
    params:{
      key:key
    }
  });
}