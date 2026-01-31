import api from '@/utils/request.js'

const module = '/movie/db'

//获取详情
export function getMovieDetail(catalogid) {
  let url = module+'/detail'
  return api.get(url,{
    params:{
      catalogid
    }
  });
}

//获取条目角色
export function getMovieCharacter(catalogid) {
  let url = module+'/characters'
  return api.get(url,{
    params:{
      catalogid
    }
  });
}

//获取章节信息
export function getMovieEpisode(catalogid) {
  let url = module+'/episodes'
  return api.get(url,{
    params:{
      catalogid
    }
  });
}

//获取播放地址
export function getPlayerUrl(params) {
  let url = module+'/playerUrl'
  return api.get(url,params);
}