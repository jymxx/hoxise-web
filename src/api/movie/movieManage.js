import api from '@/utils/request.js'

const module = '/movie/manage'

//从bangumi查询数据
export function queryBangumi(name) {
  let url = module+'/bangumi?name='+name
  return api.get(url);
}


//更新指定数据
export function updateDbBangumi(catalogid,bangumiId) {
  let form = new FormData();
  form.append('catalogid',catalogid);
  form.append('bangumiId',bangumiId);
  let url = module+'/updateDb'
  return api.put(url,form);
}

//删除指定数据
export function deleteCatalog(catalogid) {
  let url = module+'/deleteCatalog/'+catalogid;
  return api.delete(url);
}
