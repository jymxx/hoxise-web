import api from '@/utils/request.js'
import { getToken } from '@/utils/auth'


// AI生成简介
export function getAISummary(catalogId) {
  const eventSourceUrl = process.env.VUE_APP_BASE_API+"/ai/movie/aiSummary?catalogid="+catalogId+"&token="+getToken();
  return new EventSource(eventSourceUrl);
}

// AI推荐
export function aiRecommend(userText,chatId,mode = "chat") {
  const eventSourceUrl = process.env.VUE_APP_BASE_API+"/ai/movie/aiRecommend?userText="+userText+"&chatId="+chatId+"&mode="+mode+"&token="+getToken();
  return new EventSource(eventSourceUrl);
}