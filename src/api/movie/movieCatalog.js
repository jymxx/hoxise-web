import api from '@/utils/request.js'

const module = '/movie/catalog'

//随机获取数据
export function randomQuery(limit=9,userid) {
  let url = module+'/randomQuery'
    return api.get(url,{
    params:{
      limit,
      userid
    }
  });
}

//获取统计数据
export function movieStat(userid) {
  let url = module+'/movieStat'
  return api.get(url,{
    params:{
      userid
    }
  });
}

//获取最近更新的数据
export function lastUpdate(userid) {
  let url = module+'/lastUpdate'
  return api.get(url,{
    params:{
      userid
    }
  });
}

//分页查询
export function pageSimple(params) {
  let url = module+'/pageSimple'
  return api.get(url,{
    params
  });
}

//影视数据库
export function getLibrary(params) {
  let url = module+'/library'
  return api.get(url,{
    params
  });
}
