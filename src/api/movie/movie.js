import api from '@/utils/request.js'

//随机获取数据
export function randomQuery(limit=9) {
  let url = '/movie/catalog/randomQuery?limit='+limit
  return api.get(url);
}

//获取统计数据
export function movieStat() {
  let url = '/movie/catalog/movieStat'
  return api.get(url);
}

//获取最近更新的数据
export function lastUpdate() {
  let url = '/movie/catalog/lastUpdate'
  return api.get(url);
}

//分页查询
export function pageSimple(params) {
  let url = '/movie/catalog/pageSimple'
  return api.get(url,{
    params
  });
}

//影视数据库
export function getLibrary(params) {
  let url = '/movie/catalog/library'
  return api.get(url,{
    params
  });
}

//获取详情
export function getMovieDetail(catalogid) {
  let url = '/movie/db/detail'
  return api.get(url,{
    params:{
      catalogid
    }
  });
}

//获取条目角色
export function getMovieCharacter(catalogid) {
  let url = '/movie/db/characters'
  return api.get(url,{
    params:{
      catalogid
    }
  });
}

//获取章节信息
export function getMovieEpisode(catalogid) {
  let url = '/movie/db/episodes'
  return api.get(url,{
    params:{
      catalogid
    }
  });
}

//获取播放地址
export function getPlayerUrl(params) {
  let url = '/movie/db/playerUrl'
  return api.get(url,params);
}