import api from '@/utils/request.js'

const module = '/movie/db'

//获取详情
export function getMovieDetail(catalogId) {
  let url = module+'/detail'
  return api.get(url,{
    params:{
      catalogId
    }
  });
}

//获取条目角色
export function getMovieCharacter(catalogId) {
  let url = module+'/characters'
  return api.get(url,{
    params:{
      catalogId
    }
  });
}

//获取章节信息
export function getMovieEpisode(catalogId) {
  let url = module+'/episodes'
  return api.get(url,{
    params:{
      catalogId
    }
  });
}

//获取播放地址
export function getPlayerUrl(params) {
  let url = module+'/playerUrl'
  return api.get(url,params);
}