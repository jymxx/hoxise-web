import api from '@/utils/request.js'

const module = '/self/rw'

//预检
export function preCheck(paths) {
  let form = new FormData();
  form.append('paths',paths);

  let url = module+'/pre-check'
  return api.post(url,form);
}


//接收文件
export function acceptFile(preCheckId,path,file) {
  let form = new FormData();
  form.append('preCheckId',preCheckId);
  form.append('path',path);
  form.append('file',file);

  let url = module+'/accept-file'
  return api.post(url,form);
}

//开始翻译
export function startTrans(preCheckId,author,packageId,userPrompt) {
  let form = new FormData();
  form.append('preCheckId',preCheckId);
  form.append('author',author);
  form.append('packageId',packageId);
  form.append('userPrompt',userPrompt);

  let url = module+'/start-trans';
  return api.post(url,form);
}

export function getTransList(preCheckId,author,packageId,userPrompt) {
  let form = new FormData();
  form.append('preCheckId',preCheckId);
  form.append('author',author);
  form.append('packageId',packageId);
  form.append('userPrompt',userPrompt);

  let url = module+'/start-trans';
  return api.post(url,form);
}
