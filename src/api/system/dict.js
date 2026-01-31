import api from '@/utils/request.js'

const module = '/system/dict'

//随机获取数据
export function getSimpleConfig(key) {
  let url = module+'/getByKey'
  return api.get(url,{
    params:{
      key:key
    }
  });
}