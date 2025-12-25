import api from '@/utils/request.js'

//随机获取数据
export function getSimpleConfig(key) {
  let url = '/system/dict/getByKey'
  return api.get(url,{
    params:{
      key:key
    }
  });
}