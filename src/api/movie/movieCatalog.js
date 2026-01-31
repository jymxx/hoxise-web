import api from '@/utils/request.js'

const module = '/movie/catalog'

//随机获取数据
export function randomQuery(limit=9) {
  let url = module+'/randomQuery?limit='+limit
  return api.get(url);
}

//获取统计数据
export function movieStat() {
  let url = module+'/movieStat'
  return api.get(url);
}

//获取最近更新的数据
export function lastUpdate() {
  let url = module+'/lastUpdate'
  return api.get(url);
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
